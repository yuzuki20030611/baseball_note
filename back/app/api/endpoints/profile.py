from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database import get_async_db 
from app.crud import profile as profile_crud
from app.schemas.profile import CreateProfile, ResponseProfile, UpdateProfile
from app.core.logger import get_logger

logger = get_logger(__name__)

# ここでrouter = APIRouter(prefix="/profiles",  # "/profiles" tags=["profiles"])は必要ない
# main.pyでファイル名がパスになるように設定している
router = APIRouter()
# パスでログインした時の処理
# @router.post('/')  # プロフィール作成のエンドポイント
# @router.get('/{user_id}')  # プロフィール取得のエンドポイント
# @router.put('/{profile_id}')  # プロフィール更新のエンドポイント

@router.post('/', response_model=ResponseProfile, operation_id="create_profile")  #スペースを含まないIDを明示的に指定
async def create_profile_endpoint(profile: CreateProfile, db: AsyncSession = Depends(get_async_db )):
    try:
        logger.info(f"リクエスト受信: {profile}")
        # 別のログでモデルのダンプを記録
        logger.info("リクエストデータ詳細", extra={"request_data": profile.model_dump()})
                
        db_profile = await profile_crud.create_profile(db, profile)
        logger.info(f"プロフィール作成成功： {db_profile}")
        
        # 作成したプロフィールをレスポンスモデルに変換 ここでschemasのレスポンスモデルとデータベースのモデルで違いが内容にする
        resuponse_data = ResponseProfile.model_validate(db_profile)
        return resuponse_data
    except Exception as e:
        logger.error(f"プロフィール作成エラー： {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"プロフィール作成中にエラー： {str(e)}"
        )
    
@router.get('/{user_id}', response_model=ResponseProfile, operation_id="get_profile")
async def get_profile_endpoint(user_id: UUID, db: AsyncSession = Depends(get_async_db )):
    profile = await profile_crud.get_user_profile(db, user_id)
    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="profile not found"
        )
    return profile

@router.put('/{profile_id}', response_model=ResponseProfile, operation_id="update_profile")
async def update_profile_endpoint(
    profile_id: UUID, 
    profile: UpdateProfile, 
    db: AsyncSession = Depends(get_async_db )
    ):
    update_profile = await profile_crud.update_profile(db, profile_id, profile)
    if update_profile is None:
        raise HTTPException(
            status_code=404,
            detail="update_profile not found"
        )
    return update_profile