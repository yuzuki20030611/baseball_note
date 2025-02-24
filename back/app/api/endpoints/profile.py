from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.db.session import get_db
from app.crud import profile as profile_crud
from app.schemas.profile import CreateProfile, ResponseProfile, UpdateProfile
from app.core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/profiles",
    tags=["profiles"]
)
# パスでログインした時の処理
# @router.post('/')  # プロフィール作成のエンドポイント
# @router.get('/{user_id}')  # プロフィール取得のエンドポイント
# @router.put('/{profile_id}')  # プロフィール更新のエンドポイント

router.post('/', response_model=ResponseProfile)
async def create_profile_endpoint(profile: CreateProfile, db: AsyncSession = Depends(get_db)):
    """プロフィール作成API
    Args:
        profile: 作成するプロフィール情報
        db: DBセッション（自動で注入）
    Returns:
        作成されたプロフィール情報
    """
    return await profile_crud.create_profile(db, profile)
    
router.get('/{user_id}', response_model=ResponseProfile)
async def get_profile_endpoint(user_id: UUID, db: AsyncSession = Depends(get_db)):
    """プロフィール取得API
    Args:
        user_id: 取得対象のユーザーID
        db: DBセッション（自動で注入）
    Returns:
        プロフィール情報
    Raises:
        HTTPException: プロフィールが存在しない場合は404エラー
    """
    profile = await profile_crud.get_user_profile(db, user_id)
    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="profile not found"
        )
    return profile

router.put('/{profile_id}', response_model=ResponseProfile)
async def update_profile_endpoint(
    profile_id: UUID, 
    profile: UpdateProfile, 
    db: AsyncSession = Depends(get_db)
    ):
    """プロフィール更新API
    Args:
        profile_id: 更新対象のプロフィールID
        profile: 更新するプロフィール情報
        db: DBセッション（自動で注入）
    Returns:
        更新されたプロフィール情報
    Raises:
        HTTPException: プロフィールが存在しない場合は404エラー
    """
    update_profile = await profile_crud.update_profile(db, profile_id, profile)
    if update_profile is None:
        raise HTTPException(
            status_code=404,
            detail="update_profile not found"
        )
    return update_profile