import os
import shutil
import uuid
from fastapi import UploadFile, HTTPException
from pathlib import Path
import aiofiles
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

# プロフィール画像の保存先ディレクトリ
PROFILE_IMAGES_DIR = os.path.join(settings.UPLOAD_DIR, settings.PROFILE_IMAGE_DIR)

# ディレクトリが存在しない場合は作成
os.makedirs(PROFILE_IMAGES_DIR, exist_ok=True)

# 許可する画像の拡張子
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif"}

# 最大ファイルサイズは設定から取得
MAX_FILE_SIZE = settings.MAX_IMAGE_SIZE

async def validate_image(image: UploadFile) -> None:
    
    if not image or not image.filename:
        return
    
    file_ext = os.path.splitext(image.filename.lower())[1]
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"画像形式が不正です。許容されている形式: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # ファイルサイズチェック
    contents = await image.read()
    await image.seek(0)
    
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail=f"ファイルサイズが大きすぎます。最大サイズ: {MAX_FILE_SIZE/1024/1024:.1f}MB"
        )
    
    

async def save_profile_image(image: UploadFile) -> str:
    #プロフィールを保存し、保存されたpathを返す
    
    if not image or not image.filename:
        return None
    
    await validate_image(image)
    
    # ファイル名をユニークにするためにUUIDを使用
    file_ext = os.path.splitext(image.filename.lower())[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    
    # 保存先のパス
    file_path = os.path.join(PROFILE_IMAGES_DIR, unique_filename)
    
    try:
        # 画像を保存　withステートメントにより、処理が終わったら自動的にファイルが閉じられる
        async with aiofiles.open(file_path, "wb") as out_file:
            contents = await image.read()
            await out_file.write(contents)
            
        # データベースに保存するための相対パスを返す
        relative_path = f"/{settings.UPLOAD_DIR}/{settings.PROFILE_IMAGE_DIR}/{unique_filename}"
        logger.info(f"画像保存成功: {relative_path}")
        return relative_path
    except Exception as e:
        logger.error(f"画像保存エラー:{str(e)}")
        raise HTTPException(status_code=500, detail=f"画像の保存に失敗しました: {str(e)}")
        
async def delete_profile_image(image_path: str) -> bool:
    try:
        if not image_path: #削除するものがない
            return False
        # 相対パスから実際のファイルパスを取得
        filename = os.path.basename(image_path)
        file_path = os.path.join(PROFILE_IMAGES_DIR, filename)
        
        if os.path.exists(file_path): #相対パスがある場合、削除してTrueを返す
            os.remove(file_path)
            logger.info(f"画像削除成功: {file_path}")
            return True
        else:     #相対パスがない場合、削除できないので、Falseを返す
            logger.warning(f"削除しようとしたが画像が見つかりません: {file_path}")
            return False
    except Exception as e:
        logger.error(f"画像削除エラー：{str(e)}")
        return False
    