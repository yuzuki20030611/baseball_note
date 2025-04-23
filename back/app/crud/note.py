from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from uuid import UUID
import json
from typing import List, Dict, Optional
import datetime
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
    """Firebase UIDからユーザーを取得（非同期バージョン）"""

    result = await db.execute(select(Users).where(Users.firebase_uid == firebase_uid))
    return result.scalar_one_or_none()


def get_user_by_firebase_uid_sync(db: Session, firebase_uid: str) -> Optional[Users]:
    """Firebase UIDからユーザーを取得（同期バージョン）"""

    result = db.execute(select(Users).where(Users.firebase_uid == firebase_uid))
    return result.scalar_one_or_none()


def get_login_user_note_sync(db: Session, user_id: UUID) -> List[Dict]:
    """ユーザーIDに紐づくノート一覧を簡易形式で取得する（id, created_at, theme, assignmentのみ）同期バージョン"""

    stmt = (
        select(Notes.id, Notes.created_at, Notes.theme, Notes.assignment)
        .where(Notes.user_id == user_id, Notes.deleted_at.is_(None))
        .order_by(desc(Notes.created_at))
    )

    result = db.execute(stmt)
    notes = []

    for row in result:
        notes.append(
            {
                "id": row.id,
                "created_at": row.created_at,
                "theme": row.theme,
                "assignment": row.assignment,
            }
        )

    return notes


def delete_note(db: Session, note_id: UUID) -> bool:
    """ノートを論理削除します"""

    note = (
        db.query(Notes).filter(Notes.id == note_id, Notes.deleted_at.is_(None)).first()
    )
    if not note:
        return False

    note.deleted_at = datetime.datetime.now()
    db.commit()
    return True


def get_note_detail(db: Session, note_id: UUID):
    """ノートの詳細情報を取得する"""

    # ノートとトレーニングノート、トレーニング情報を一緒に取得
    note = (
        db.query(Notes)
        .options(joinedload(Notes.training_notes).joinedload(TrainingNotes.training))
        .filter(Notes.id == note_id, Notes.deleted_at.is_(None))
        .first()
    )

    if not note:
        return None

    return note
