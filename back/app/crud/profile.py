from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from sqlalchemy import select
from app.models.base import Profiles
from app.schemas.profile import CreateProfile, UpdateProfile



async def create_profile(db: AsyncSession, profile: CreateProfile) -> Profiles:
    # 既存のプロフィールがあるか確認
    existing_profile = await get_user_profile(db, profile.user_id)
    if existing_profile:
        # 既存のプロフィールを更新するか、エラーを返すかの処理
        # 例: raise HTTPException(status_code=400, detail="プロフィールが既に存在します")
        pass
    
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
    #IDが一致するプロフィールが1つ見つかればそれを返し、見つからなければ None を返します。複数見つかった場合はエラーになります。
    db_profile = result.scalar_one_or_none()
    
    if db_profile is None:
        return None
        # UpdateProfileの更新されたフィールドのみを辞書として取得。ここでは変更があった値のみを辞書型として抽出している
        #setattrでデータベースオブジェクトの対応する属性を更新する  exclude_unset=Trueで明示的に値が設定されたフィールドのみと限定している
        #setattr（オブジェクト名、オブジェクトのカラム名、　新しい値）これで、変更できるように設定して、そのあと、データベースに保存してようやく修正が完了
        #この時点では、変更はメモリ上のオブジェクトにのみ適用されている（DBには保存されていない）
    for key, value in profile.model_dump(exclude_unset=True).items():
        setattr(db_profile, key, value)  #ブジェクトの属性を動的に設定
    
    await db.commit()
    await db.refresh(db_profile)
    return db_profile

async def get_profile_by_id(db: AsyncSession, profile_id: UUID) -> Profiles | None:
    """プロフィールIDからプロフィールを取得する"""
    result = await db.execute(
         select(Profiles).where(Profiles.id == profile_id)
    )
    profile = result.scalar_one_or_none()
    return profile
   