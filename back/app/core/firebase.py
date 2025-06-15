import firebase_admin
from firebase_admin import credentials
from app.core.config import settings
import os


def initialize_firebase():
    """Firebase Adminの初期化"""

    # テスト環境ではFirebase初期化をスキップ
    if os.environ.get("ENV") == "development":
        print("Development mode: Skipping Firebase initialization")
        return None

    # 本番環境では通常通り初期化
    try:
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
            print("Firebase Admin SDK initialized successfully")
    except Exception as e:
        print(f"Firebase initialization failed: {e}")
        # エラーでもアプリケーションは継続
        pass

    return firebase_admin
