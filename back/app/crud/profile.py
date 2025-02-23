from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from sqlalchemy import select
from app.models.base import Profiles
from app.schemas.profile import CreateProfile, UpdateProfile

# 作成、取得、更新の関数を作成
# async def create_profile()  # データベースへの作成処理
# async def get_user_profile()  # データベースからの取得処理
# async def update_profile()  # データベースの更新処理

async def create_profile(db: AsyncSession, profile: CreateProfile) -> Profiles:
    """プロフィールを作成する
    Args:
        db: データベースセッション
        profile: 作成するプロフィール情報
    Returns:
        作成されたプロフィール
    """
    db_profile = Profiles(**profile.model_dump())
    db.add(db_profile)
    await db.commit()
    await db.refresh(db_profile)
    return db_profile

async def get_user_profile(db: AsyncSession, user_id: UUID) -> Profiles | None:
    """ユーザーIDに基づいてプロフィールを取得する
    
    Args:
        db: データベースセッション
        user_id: 取得したいユーザーのID
    
    Returns:
        ユーザーのプロフィール。存在しない場合はNone
    """
    # db.execute(): このSQLを実行する
    result = await db.execute(
        select(Profiles).where(Profiles.user_id == user_id)
    )
    # 単一の結果を取得する場合
    # 複数の結果を取得する場合
    # profiles = result.scalars().all()
    profile = result.scalar_one_or_none()
    return profile

async def update_profile(
    db: AsyncSession, 
    profile_id: UUID, 
    profile: UpdateProfile
) -> Profiles | None:
    """プロフィールを更新する
    Args:
        db: データベースセッション
        profile_id: 更新対象のプロフィールID
        profile: 更新するプロフィール情報
    Returns:
        更新されたプロフィール、存在しない場合はNone
    """
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
