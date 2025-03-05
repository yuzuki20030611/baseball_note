from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database import get_async_db 
from app.crud import profile as profile_crud
from app.schemas.profile import CreateProfile, ResponseProfile, UpdateProfile
from app.core.logger import get_logger
from app.utils.image import save_profile_image, delete_profile_image

logger = get_logger(__name__)

# ここでrouter = APIRouter(prefix="/profiles",  # "/profiles" tags=["profiles"])は必要ない
# main.pyでファイル名がパスになるように設定している
router = APIRouter()
# パスでログインした時の処理
# @router.post('/')  # プロフィール作成のエンドポイント
# @router.get('/{user_id}')  # プロフィール取得のエンドポイント
# @router.put('/{profile_id}')  # プロフィール更新のエンドポイント

@router.post('/', response_model=ResponseProfile, operation_id="create_profile")  #スペースを含まないIDを明示的に指定
async def create_profile_endpoint(
    name: str = Form(...),    # ... は必須という意味
    team_name: str = Form(...),
    birthday: str = Form(...),
    player_dominant: str = Form(...),
    player_position: str = Form(...),
    user_id: str = Form(...),
    admired_player: Optional[str] = Form(None),
    introduction: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_async_db)
):
    try:
        logger.info('プロフィール作成リクエスト受信')
        
        # 画像がアップロードされた場合は保存
        image_path = None #プロフィール作成なので、画像は保存されていない状態
        if image and image.filename: #imageオブジェクト自体が存在し、値が None ではない）image オブジェクトに filename 属性が存在している場合
            image_path = await save_profile_image(image)  #image_pathにしているのはデータベースに保存するため
        
        # CreateProfileモデルを作成
        profile_data = CreateProfile(
            user_id=UUID(user_id),
            name=name,
            team_name=team_name,
            birthday=birthday,
            player_dominant=player_dominant,
            player_position=player_position,
            admired_player=admired_player,
            introduction=introduction,
            image_path=image_path
        )
        
         # プロフィールをデータベースに保存
        db_profile = await profile_crud.create_profile(db, profile_data)
        logger.info(f"プロフィール作成成功： {db_profile.id}")
        
        # 作成したプロフィールをレスポンスモデルに変換 ここでschemasのレスポンスモデルとデータベースのモデルで違い
        response_data = ResponseProfile.model_validate(db_profile)
        return response_data
    except Exception as e:
        logger.error(f"プロフィール作成エラー： {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"プロフィール作成中にエラー： {str(e)}"
        )
    
@router.get('/{user_id}', response_model=ResponseProfile, operation_id="get_profile")
async def get_profile_endpoint(user_id: UUID, db: AsyncSession = Depends(get_async_db )):
    try:
        logger.info('プロフィール取得リクエスト成功')
        #プロフィール取得
        profile = await profile_crud.get_user_profile(db, user_id)
        logger.info('プロフィール取得成功')
        if profile is None:
            raise HTTPException(
                status_code=404,
                detail="プロフィールが存在しません"
        )
        response_profile = ResponseProfile.model_validate(profile)
        return response_profile
    except Exception as e:
        logger.error(f"プロフィール情報取得エラー： {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"プロフィール取得中にエラー： {str(e)}"
        )

@router.put('/{profile_id}', response_model=ResponseProfile, operation_id="update_profile")
async def update_profile_endpoint(
    profile_id: UUID, 
    name: Optional[str] = Form(None),
    team_name: Optional[str] = Form(None),
    birthday: Optional[str] = Form(None),
    player_dominant: Optional[str] = Form(None),
    player_position: Optional[str] = Form(None),
    admired_player: Optional[str] = Form(None),
    introduction: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    delete_image: bool = Form(False),
    db: AsyncSession = Depends(get_async_db)
    ):
    try:
        existing_profile = await profile_crud.get_profile_by_id(db, profile_id)
        if not existing_profile:
            raise HTTPException(status_code=404, detail="プロフィールが見つかりません") #raise は例外を手動で発生させるPythonのキーワードです
        
        update_data = {}
        if name is not None:
            update_data["name"] = name
        if team_name is not None:
            update_data["team_name"] = team_name
        if birthday is not None:
            update_data["birthday"] = birthday
        if player_dominant is not None:
            update_data["player_dominant"] = player_dominant
        if player_position is not None:
            update_data["player_position"] = player_position
        if admired_player is not None:
            update_data["admired_player"] = admired_player
        if introduction is not None:
            update_data["introduction"] = introduction
        
        # 画像の処理
        if delete_image and existing_profile.image_path:
            # 画像を削除する場合
            await delete_profile_image(existing_profile.image_path)
            update_data["image_path"] = None
        elif image and image.filename:
            # 新しい画像をアップロードする場合
            if existing_profile.image_path:
                # 既存の画像があれば削除
                await delete_profile_image(existing_profile.image_path)
            
            # 新しい画像を保存してパスを取得
            new_image_path = await save_profile_image(image)
            update_data["image_path"] = new_image_path  # ここで更新データに追加
        #**辞書（dictionary）のキーと値のペアを関数やクラスの引数として展開する役割
        update_profile_data = UpdateProfile(**update_data)
        updated_profile = await profile_crud.update_profile(db, profile_id, update_profile_data)
        
        return updated_profile
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"プロフィール更新エラー: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"エラー: {str(e)}")
    