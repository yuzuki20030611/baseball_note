from pydantic import ConfigDict

from app.schemas.core import BaseSchema

# APIリクエストの基本情報（IPアドレスとホスト名）を返すためのレスポンススキーマを定義

class RequestInfoResponse(BaseSchema):
    model_config = ConfigDict(from_attributes=True)
    ip_address: str | None
    host: str | None
