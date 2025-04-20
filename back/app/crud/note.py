from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
import json

from app.models.base import Notes, TrainingNotes, Users


async def create_note(
    db: AsyncSession, user_id: UUID, note_data: dict, video_path: Optional[str] = None
) -> Notes:
    """野球ノートを作成する"""

    # 新しいノートの作成
    new_note = Notes(
        user_id=user_id,
        theme=note_data["theme"],
        assignment=note_data["assignment"],
        practice_video=note_data.get("practice_video"),
        my_video=video_path,  # Firebase Storageのパス
        weight=float(note_data["weight"]),
        sleep=float(note_data["sleep"]),
        looked_day=note_data["looked_day"],
        practice=note_data.get("practice"),
    )

    # データベースに追加
    db.add(new_note)
    await db.flush()  # IDを取得するためにflush

    # トレーニングの関連付け
    trainings_data = json.loads(note_data["trainings"])
    for training in trainings_data:
        training_note = TrainingNotes(
            note_id=new_note.id,
            training_id=UUID(training["training_id"]),
            count=int(training["count"]),
        )
        db.add(training_note)

    # 変更をコミット
    await db.commit()
    await db.refresh(new_note)

    return new_note


async def get_user_by_firebase_uid(db: Session, firebase_uid: str) -> Optional[Users]:
    """Firebase UIDからユーザーを取得"""
    from sqlalchemy import select

    result = await db.execute(select(Users).where(Users.firebase_uid == firebase_uid))
    return result.scalar_one_or_none()
