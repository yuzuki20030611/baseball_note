from fastapi import Request
from fastapi.security import OAuth2PasswordBearer
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings
from app.exceptions.error_messages import ErrorMessage
from app.exceptions.core import APIException


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=settings.TOKEN_URL
)

GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID

async def verify_token(request: Request):
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise APIException(ErrorMessage.INVALID_TOKEN)
        token = auth_header.split(" ")[1]
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
        return idinfo
    except ValueError:
        raise APIException(ErrorMessage.INVALID_TOKEN)
