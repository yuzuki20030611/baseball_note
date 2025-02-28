import os
import shutil
import uuid
from fastapi import UploadFile
from pathlib import Path
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

def get_profile_image_path():
    upload_dir = Path(settings.UPLOAD_DIR) #指定された基本アップロードディレクトリ（例：「uploads」）を取得
    profile_dir = upload_dir / settings.PROFILE_IMAGE_DIR #その中にsettings.PROFILE_IMAGE_DIRで指定されたサブディレクトリ（例：「profiles」）へのパスを作成
    
    os.makedirs(profile_dir, exist_ok=True) #そのディレクトリが存在しない場合は作成する
    
    return profile_dir

#例　/uploads/profiles/550e8400-e29b-41d4-a716-446655440000.jpg
#uploadsはsettings.UPLOAD_DIRの値 profilesはsettings.PROFILE_IMAGE_DIRの値 550e8400-e29b-41d4-a716-446655440000.jpgはUUIDベースの一意のファイル名

async def save_profile_image(image: UploadFile) -> str:
    #プロフィールを保存し、保存されたpathを返す
    try:
        content_type = image.content_type
        extension = ""
        
        if content_type == "image/jpeg":
            extension = ".jpg"
        elif content_type == "image/png":
            extension = ".png"
        else:
            extension = ".jpg"
            
        # ユニークなファイル名を生成
        filename = f"{uuid.uuid4()}{extension}"
        
        # 保存先のフルパスを作成
        profile_dir = get_profile_image_path()
        file_path = profile_dir / filename
        
        # 画像を保存　withステートメントにより、処理が終わったら自動的にファイルが閉じられる
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer) #shutil.copyfileobj関数を使用して、アップロードされた画像ファイルのデータをディスクに効率的にコピーします
            
        # データベースに保存するためのパスを返す
        relative_path = f"/{settings.UPLOAD_DIR}/{settings.PROFILE_IMAGE_DIR}/{filename}"
        return relative_path
    except Exception as e:
        logger.error(f"画像保存エラー:{str(e)}")
        
async def delete_profile_image(image_path: str) -> bool:
    try:
        if not image_path:
            return False
    
        #image_path.lstrip("/"): 画像パスの先頭にあるスラッシュ（/）を削除します。これは通常、Webアプリケーションで使用される相対パス
        file_path = Path(image_path.lstrip("/"))
        
        if file_path.exists():
            os.remove(file_path)
            return True
        else:
            return False
    except Exception as e:
        logger.error(f"画像削除エラー：{str(e)}")
        return False
    