import logging
import os
import importlib

import sentry_sdk
from fastapi import FastAPI
from sentry_sdk.integrations.asgi import SentryAsgiMiddleware
from sentry_sdk.integrations.logging import LoggingIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from starlette.middleware.cors import CORSMiddleware

from app.api.apps import admin_app

from app.app_manager import FastAPIAppManager
from app.core.config import settings
from app.core.logger import get_logger
from app.middleware.auth import AuthMiddleware


# loggingセットアップ
logger = get_logger(__name__)


class NoParsingFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return not record.getMessage().find("/docs") >= 0

# /docsのログが大量に表示されるのを防ぐ
logging.getLogger("uvicorn.access").addFilter(NoParsingFilter())

sentry_logging = LoggingIntegration(level=logging.INFO, event_level=logging.ERROR)

app = FastAPI(
    title=settings.TITLE,
    version=settings.VERSION,
    debug=settings.DEBUG or False,
)
app_manager = FastAPIAppManager(root_app=app)

if settings.SENTRY_SDK_DNS:
    sentry_sdk.init(
        dsn=settings.SENTRY_SDK_DNS,
        integrations=[sentry_logging, SqlalchemyIntegration()],
        environment=settings.ENV,
    )

app.add_middleware(SentryAsgiMiddleware)
if not settings.AUTH_SKIP:
    app.add_middleware(AuthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
    allow_origin_regex=r"^https?:\/\/([\w\-\_]{1,}\.|)example\.com",
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["info"])
def get_info() -> dict[str, str]:
    return {"title": settings.TITLE, "version": settings.VERSION}

# debugモード時はfastapi-tool-barを有効化する
def load_routers():
    routers = []
    endpoints_dir = os.path.join(os.path.dirname(__file__), "api", "endpoints")
    for filename in os.listdir(endpoints_dir):
        if not filename.endswith(".py") or filename.startswith("__"):
            continue
        module_name = f"app.api.endpoints.{filename[:-3]}"
        module = importlib.import_module(module_name)
        if not hasattr(module, "router"):
            continue
        router = module.router
        tag = filename[:-3].capitalize()
        prefix = f"/{filename[:-3]}"
        routers.append((router, tag, prefix))
    return sorted(routers, key=lambda x: x[2])

routers = load_routers()

for router, tag, prefix in routers:
    app.include_router(router, tags=[tag], prefix=prefix)

app_manager.add_app(path="admin", app=admin_app.app)
app_manager.setup_apps_docs_link()

# debugモード時はfastapi-tool-barを有効化する
if settings.DEBUG:
    from debug_toolbar.middleware import DebugToolbarMiddleware

    app.add_middleware(
        DebugToolbarMiddleware,
        panels=["app.core.database.SQLAlchemyPanel"],
    )

# Google Cloud Runで必要な設定
if __name__ == '__main__':
    import uvicorn
    # 環境変数 'PORT' からポート番号を取得。デフォルトは80
    port = int(os.environ.get('PORT', 80))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
