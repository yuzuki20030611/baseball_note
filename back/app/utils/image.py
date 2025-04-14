import os
import uuid
from fastapi import UploadFile, HTTPException
from app.core.config import settings
from app.core.logger import get_logger
from app.core.firebase import initialize_firebase
from firebase_admin import storage

logger = get_logger(__name__)

# プロフィール画像の保存先ディレクトリ
PROFILE_IMAGES_DIR = os.path.join(settings.UPLOAD_DIR, settings.PROFILE_IMAGE_DIR)

# ディレクトリが存在しない場合は作成
os.makedirs(PROFILE_IMAGES_DIR, exist_ok=True)

# 許可する画像の拡張子
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"}

# 最大ファイルサイズは設定から取得
MAX_FILE_SIZE = settings.MAX_IMAGE_SIZE

# Firebase初期化
initialize_firebase()


async def validate_image(image: UploadFile) -> None:
    if not image or not image.filename:
        return

    file_ext = os.path.splitext(image.filename.lower())[1]
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"画像形式が不正です。許容されている形式: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # ファイルサイズチェック
    contents = await image.read()
    await image.seek(0)

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"ファイルサイズが大きすぎます。最大サイズ: {MAX_FILE_SIZE / 1024 / 1024:.1f}MB",
        )


async def save_profile_image(image: UploadFile) -> str:
    # プロフィールを保存し、保存されたpathを返す

    if not image or not image.filename:
        return None

    await validate_image(image)

    try:
        # ファイル名をユニークにするためにUUIDを使用
        # 拡張子のみを取得
        file_ext = os.path.splitext(image.filename.lower())[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"

        # Firebase内のパス
        storage_path = f"profile_images/{unique_filename}"

        # ファイル内容を読み込む
        contents = await image.read()

        # バケット取得（保存場所）
        bucket = storage.bucket()

        # blobオブジェクト作成
        # これにより作成、取得、削除を行うことが可能になる
        blob = bucket.blob(storage_path)

        # メモリからアップロード
        # web標準に従った適切な画像ファイルのみをアップロード、テキストなどを保存しないため
        blob.upload_from_string(
            contents,
            content_type=f"image/{file_ext[1:]}"
            if file_ext != ".jpg"
            else "image/jpeg",
        )

        logger.info(f"Firebase Storageに画像保存成功: {storage_path}")
        # 詳細画面で表示する際にURLが必要で、その際にこのパス名をデータベースに保存して、フロントエンドに渡す際に、
        # このパス名を指定することで、Firebaseから画像のURL取得
        return storage_path

    except Exception as e:
        logger.error(f"画像保存エラー:{str(e)}")
        raise HTTPException(
            status_code=500, detail=f"画像の保存に失敗しました: {str(e)}"
        )


async def delete_profile_image(image_path: str) -> bool:
    """Firebase Storageから画像を削除"""
    try:
        if not image_path:  # 削除するものがない
            return False
        # バケット取得
        bucket = storage.bucket()

        # blob取得
        blob = bucket.blob(image_path)

        # 存在確認して削除
        if blob.exists():
            blob.delete()
            logger.info(f"画像削除成功: {image_path}")
            return True
        else:
            logger.warning(f"画像が見つかりません: {image_path}")
            return False
    except Exception as e:
        logger.error(f"画像削除エラー：{str(e)}")
        return False


def get_image_url(image_path: str) -> str:
    """Firebase Storageの画像URLを取得"""

    if not image_path:
        logger.info("image_path is None, returning None")
        return None

    try:
        # バケット取得
        bucket = storage.bucket()

        # blob取得
        blob = bucket.blob(image_path)

        # blobが存在するか確認
        exists = blob.exists()

        if not exists:
            logger.warning(f"画像が見つかりません: {image_path}")
            return None

        # 署名付きURL生成（1時間有効）
        url = blob.generate_signed_url(
            version="v4",
            expiration=3600,  # 1時間
            method="GET",
        )

        logger.info(f"画像URL生成成功: {url[:50]}...")  # URLの一部のみログに出力
        return url
    except Exception as e:
        logger.error(f"URL生成エラー: {str(e)}", exc_info=True)
        return None
