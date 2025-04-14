import firebase_admin
from firebase_admin import credentials
from app.core.config import settings
import os


def initialize_firebase():
    """Firebase Adminの初期化"""
    if not firebase_admin._apps:
        # サービスアカウントキーのパス
        key_path = os.path.join(
            settings.ROOT_DIR_PATH,
            settings.FIREBASE_SERVICE_ACCOUNT_KEY_PATH,
        )
        # 認証情報の設定 : Firebase Adminを使用するための認証情報を作成
        cred = credentials.Certificate(key_path)

        # Firebase初期化
        firebase_admin.initialize_app(
            cred, {"storageBucket": settings.FIREBASE_STORAGE_BUCKET}
        )

    return firebase_admin
