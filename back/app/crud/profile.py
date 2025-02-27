from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from sqlalchemy import select
from app.models.base import Profiles
from app.schemas.profile import CreateProfile, UpdateProfile



async def create_profile(db: AsyncSession, profile: CreateProfile) -> Profiles:
    db_profile = Profiles(**profile.model_dump())
    db.add(db_profile)
    await db.commit()
    await db.refresh(db_profile)
    return db_profile

async def get_user_profile(db: AsyncSession, user_id: UUID) -> Profiles | None:
    # db.execute(): このSQLを実行する
    result = await db.execute(
        select(Profiles).where(Profiles.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    return profile

async def update_profile(
    db: AsyncSession, 
    profile_id: UUID, 
    profile: UpdateProfile
) -> Profiles | None:
    result = await db.execute(
        select(Profiles).where(Profiles.id == profile_id)
    )
    db_profile = result.scalar_one_or_none()
    
    if db_profile is None:
        return None
        # UpdateProfileの更新されたフィールドのみを辞書として取得
    for key, value in profile.model_dump(exclude_unset=True).items():
        setattr(db_profile, key, value)  #ブジェクトの属性を動的に設定
    
    await db.commit()
    await db.refresh(db_profile)
    return db_profile
