import os
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


# coreディレクトリは、アプリケーションの中核となる設定や機能を格納する場所です
# アプリケーション全体の設定
# データベース設定
class Settings(BaseSettings):
    # NOTE: .envファイルや環境変数が同名の変数にセットされる
    TITLE: str = "education-standardization"
    ENV: str = ""
    DEBUG: bool = False
    VERSION: str = "0.0.1"
    CORS_ORIGINS: list[str] = [
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3000",
        "http://localhost:3333",
        "https://baseball-note-backend-218218207988.asia-northeast1.run.app",  # ← これを追加（必須）
    ]
    BASE_DIR_PATH: str = str(Path(__file__).parent.parent.absolute())
    ROOT_DIR_PATH: str = str(Path(__file__).parent.parent.parent.absolute())
    DB_HOST: str = ""
    DB_PORT: str = "5432"
    DB_NAME: str = ""
    DB_USER_NAME: str = ""
    DB_PASSWORD: str = ""
    API_GATEWAY_STAGE_PATH: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SECRET_KEY: str = "secret"
    LOGGER_CONFIG_PATH: str = os.path.join(BASE_DIR_PATH, "logger_config.yaml")
    SENTRY_SDK_DNS: str = ""
    MIGRATIONS_DIR_PATH: str = os.path.join(ROOT_DIR_PATH, "alembic")
    AUTH_SKIP: bool = False
    UPLOAD_DIR: str = "uploads"
    PROFILE_IMAGE_DIR: str = "profile_images"
    MAX_IMAGE_SIZE: int = 5 * 1024 * 1024  # 5MB

    # Firebase設定
    FIREBASE_STORAGE_BUCKET: str = "web-baseball.firebasestorage.app"
    FIREBASE_SERVICE_ACCOUNT_KEY_PATH: str = ".firebase-service-account-key.json"

    def get_database_url(self, is_async: bool = False) -> str:
        if is_async:
            return (
                "postgresql+asyncpg://"
                f"{self.DB_USER_NAME}:{self.DB_PASSWORD}@"
                f"{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            )
        else:
            return (
                "postgresql://"
                f"{self.DB_USER_NAME}:{self.DB_PASSWORD}@"
                f"{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            )

    model_config = SettingsConfigDict(env_file=".env")

    def get_app_title(self, app_name: str) -> str:
        return f"[{self.ENV}]{self.TITLE}({app_name=})"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
