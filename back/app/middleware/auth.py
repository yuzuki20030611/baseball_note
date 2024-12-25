from fastapi import Request
from app.core.auth import verify_token
from app.exceptions.core import APIException
from starlette.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class AuthMiddleware(BaseHTTPMiddleware):
    PUBLIC_PATHS = ["/", "/docs", "/redoc", "/openapi.json"]
    async def dispatch(self, request: Request, call_next):
        try:
            if request.url.path in self.PUBLIC_PATHS or request.url.path.startswith("/docs/"):
                return await call_next(request)
            token_info = await verify_token(request)
            request.state.token_info = token_info
            return await call_next(request)
        except APIException as e:
            return JSONResponse(
                status_code=e.status_code,
                content={"detail": e.detail}
            )
