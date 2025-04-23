import os
import uuid
from fastapi import UploadFile, HTTPException
from app.core.logger import get_logger
from firebase_admin import storage

logger = get_logger(__name__)

# 許可する動画の拡張子
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".wmv"}
MAX_VIDEO_SIZE = 50 * 1024 * 1024  # 50MB


async def validate_video(video: UploadFile) -> None:
    """動画ファイルのバリデーション"""
    if not video or not video.filename:
        return

    # ファイル拡張子の確認
    file_ext = os.path.splitext(video.filename.lower())[1]
    if file_ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"サポートされていない動画形式です。対応形式: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}",
        )

    # ファイルサイズの確認
    file_contents = await video.read()
    await video.seek(0)  # ファイルポインタを先頭に戻す

    if len(file_contents) > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"ファイルサイズが大きすぎます。上限: {MAX_VIDEO_SIZE / (1024 * 1024)}MB",
        )


async def save_note_video(video: UploadFile) -> str:
    """動画ファイルをFirebase Storageに保存し、パスを返す"""
    if not video or not video.filename:
        return None

    try:
        # ユニークなファイル名を生成
        file_ext = os.path.splitext(video.filename.lower())[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"

        # Firebase内のパス
        storage_path = f"note_videos/{unique_filename}"

        # ファイル内容を読み込む
        contents = await video.read()

        # Firebase Storageに保存
        bucket = storage.bucket()
        blob = bucket.blob(storage_path)

        # コンテンツタイプの設定
        content_type = "video/mp4"
        if file_ext == ".mov":
            content_type = "video/quicktime"
        elif file_ext == ".avi":
            content_type = "video/x-msvideo"
        elif file_ext == ".wmv":
            content_type = "video/x-ms-wmv"

        # アップロード
        blob.upload_from_string(contents, content_type=content_type)

        logger.info(f"動画保存成功: {storage_path}")
        return storage_path

    except Exception as e:
        logger.error(f"動画保存エラー: {str(e)}")
        raise HTTPException(status_code=500, detail=f"動画保存に失敗しました: {str(e)}")


def get_video_url(video_path: str) -> str:
    """Firebase Storageの動画を取得する"""
    if not video_path:
        logger.info("ビデオのパスが見つかりません")
        return None
    try:
        # バケット取得
        bucket = storage.bucket()

        # 作成していたblob取得を取得
        blob = bucket.blob(video_path)

        # blobが存在するか確認
        exists = blob.exists()

        if not exists:
            logger.warning(f"動画が見つかりません: {video_path}")
            return None

        # 署名付きURL生成（1時間有効）
        url = blob.generate_signed_url(version="v4", expiration=3600, method="GET")
        logger.info(f"動画URL生成方法: {url[:50]}...")
        return url
    except Exception as e:
        logger.info(f"URL生成エラー: {str(e)}", exc_info=True)
        return None
