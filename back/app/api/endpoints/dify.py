from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.core.database import get_db
from app.models.base import Users, Profiles, Notes, Trainings, TrainingNotes
from app.core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


def get_all_table_data(db: Session) -> Dict[str, List[Dict[str, Any]]]:
    """
    システム内の全テーブルデータを取得する関数
    """

    # 全ユーザー情報（削除されたものも含む）
    users = []
    user_records = (
        db.query(Users)
        .execution_options(include_deleted=True)  # 削除済みデータも含める
        .order_by(Users.created_at.desc())
        .all()
    )
    for user in user_records:
        users.append(
            {
                "id": str(user.id),
                "firebase_uid": user.firebase_uid,
                "email": user.email,
                "role": user.role,
                "deleted_at": user.deleted_at.isoformat()
                if user.deleted_at
                else None,  # 削除日時を追加
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None,
            }
        )

    # 全プロフィール情報（削除されたものも含む）
    profiles = []
    profile_records = (
        db.query(Profiles)
        .execution_options(include_deleted=True)  # 削除済みデータも含める
        .order_by(Profiles.created_at.desc())
        .all()
    )
    for profile in profile_records:
        profiles.append(
            {
                "id": str(profile.id),
                "user_id": str(profile.user_id),
                "name": profile.name,
                "team_name": profile.team_name,
                "position": profile.player_position,
                "dominant_hand": profile.player_dominant,
                "birthday": profile.birthday.isoformat() if profile.birthday else None,
                "admired_player": profile.admired_player,
                "introduction": profile.introduction,
                "created_at": profile.created_at.isoformat()
                if profile.created_at
                else None,
                "updated_at": profile.updated_at.isoformat()
                if profile.updated_at
                else None,
            }
        )

    # 全ノート情報（削除されたものも含む）
    notes = []
    note_records = (
        db.query(Notes)
        .execution_options(include_deleted=True)  # 削除済みデータも含める
        .order_by(Notes.created_at.desc())
        .all()
    )
    for note in note_records:
        notes.append(
            {
                "id": str(note.id),
                "user_id": str(note.user_id),
                "theme": note.theme,
                "assignment": note.assignment,
                "weight": float(note.weight) if note.weight else None,
                "sleep": float(note.sleep) if note.sleep else None,
                "looked_day": note.looked_day,
                "practice": note.practice,
                "practice_video": note.practice_video,
                "my_video": note.my_video,
                "deleted_at": note.deleted_at.isoformat() if note.deleted_at else None,
                "created_at": note.created_at.isoformat() if note.created_at else None,
                "updated_at": note.updated_at.isoformat() if note.updated_at else None,
            }
        )

    # 全トレーニング情報（削除されたものも含む）
    trainings = []
    training_records = (
        db.query(Trainings)
        .execution_options(include_deleted=True)  # 削除済みデータも含める
        .order_by(Trainings.created_at.desc())
        .all()
    )
    for training in training_records:
        trainings.append(
            {
                "id": str(training.id),
                "user_id": str(training.user_id),
                "menu": training.menu,
                "deleted_at": training.deleted_at.isoformat()
                if training.deleted_at
                else None,
                "created_at": training.created_at.isoformat()
                if training.created_at
                else None,
            }
        )

    # 全トレーニングノート関連情報（削除されたものも含む）
    training_notes = []
    tn_records = (
        db.query(TrainingNotes)
        .execution_options(include_deleted=True)  # 削除済みデータも含める
        .order_by(TrainingNotes.created_at.desc())
        .all()
    )
    for tn in tn_records:
        training_notes.append(
            {
                "id": str(tn.id),
                "training_id": str(tn.training_id),
                "note_id": str(tn.note_id),
                "count": tn.count,
                "deleted_at": tn.deleted_at.isoformat() if tn.deleted_at else None,
                "created_at": tn.created_at.isoformat() if tn.created_at else None,
                "updated_at": tn.updated_at.isoformat() if tn.updated_at else None,
            }
        )

    return {
        "users": users,
        "profiles": profiles,
        "notes": notes,
        "trainings": trainings,
        "training_notes": training_notes,
    }


def get_user_related_data(
    db: Session,
    user_id: str,
) -> Dict[str, Any]:
    """
    特定ユーザーの関連データを取得する関数
    """

    # プロフィール情報取得（削除されたものも含む）
    my_profile = None
    profile = (
        db.query(Profiles)
        .filter(Profiles.user_id == user_id)
        .execution_options(include_deleted=True)
        .first()
    )
    if profile:
        my_profile = {
            "id": str(profile.id),
            "name": profile.name,
            "team_name": profile.team_name,
            "position": profile.player_position,
            "dominant_hand": profile.player_dominant,
            "birthday": profile.birthday.isoformat() if profile.birthday else None,
            "admired_player": profile.admired_player,
            "introduction": profile.introduction,
            "created_at": profile.created_at.isoformat()
            if profile.created_at
            else None,
            "updated_at": profile.updated_at.isoformat()
            if profile.updated_at
            else None,
        }

    # ノート情報取得（削除されたものも含む）
    my_notes = []
    note_records = (
        db.query(Notes)
        .filter(Notes.user_id == user_id)
        .execution_options(include_deleted=True)
        .order_by(Notes.created_at.desc())
        .all()
    )
    for note in note_records:
        my_notes.append(
            {
                "id": str(note.id),
                "theme": note.theme,
                "assignment": note.assignment,
                "weight": float(note.weight) if note.weight else None,
                "sleep": float(note.sleep) if note.sleep else None,
                "looked_day": note.looked_day,
                "practice": note.practice,
                "practice_video": note.practice_video,
                "my_video": note.my_video,
                "deleted_at": note.deleted_at.isoformat() if note.deleted_at else None,
                "created_at": note.created_at.isoformat() if note.created_at else None,
                "updated_at": note.updated_at.isoformat() if note.updated_at else None,
            }
        )

    # トレーニング情報取得（削除されたものも含む）
    my_trainings = []
    training_records = (
        db.query(Trainings)
        .filter(Trainings.user_id == user_id)
        .execution_options(include_deleted=True)
        .order_by(Trainings.created_at.desc())
        .all()
    )
    for training in training_records:
        my_trainings.append(
            {
                "id": str(training.id),
                "menu": training.menu,
                "deleted_at": training.deleted_at.isoformat()
                if training.deleted_at
                else None,
                "created_at": training.created_at.isoformat()
                if training.created_at
                else None,
            }
        )

    # トレーニングノート関連情報（削除されたものも含む）
    my_training_notes = []
    training_note_records = (
        db.query(TrainingNotes)
        .join(Notes, TrainingNotes.note_id == Notes.id)
        .filter(Notes.user_id == user_id)
        .execution_options(include_deleted=True)
        .order_by(TrainingNotes.created_at.desc())
        .all()
    )
    for tn in training_note_records:
        my_training_notes.append(
            {
                "id": str(tn.id),
                "training_id": str(tn.training_id),
                "note_id": str(tn.note_id),
                "count": tn.count,
                "deleted_at": tn.deleted_at.isoformat() if tn.deleted_at else None,
                "created_at": tn.created_at.isoformat() if tn.created_at else None,
                "updated_at": tn.updated_at.isoformat() if tn.updated_at else None,
            }
        )

    return {
        "profile": my_profile,
        "notes": my_notes,
        "trainings": my_trainings,
        "training_notes": my_training_notes,
    }


@router.get("/data", response_model=Dict[str, Any])
async def get_user_data(
    firebase_uid: str = Query(..., description="Firebase UID of the user"),
    db: Session = Depends(get_db),
):
    """
    特定ユーザーの情報を取得するエンドポイント
    Difyチャットボットで使用します
    """

    # ユーザーが存在するか確認（削除されたユーザーも含む）
    user = (
        db.query(Users)
        .filter(Users.firebase_uid == firebase_uid)
        .execution_options(include_deleted=True)
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 現在のユーザー情報
    current_user = {
        "id": str(user.id),
        "firebase_uid": user.firebase_uid,
        "email": user.email,
        "role": user.role,
        "deleted_at": user.deleted_at.isoformat() if user.deleted_at else None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
    }

    # ヘルパー関数を使用してユーザー関連データを取得
    my_data = get_user_related_data(db, user.id)

    return {"current_user": current_user, "my_data": my_data}


@router.get("/all-data", response_model=Dict[str, Any])
async def get_all_data(
    db: Session = Depends(get_db),
):
    """
    全データを取得するエンドポイント
    Difyチャットボットで使用します
    """

    # ヘルパー関数を使用して全テーブル情報を取得
    return get_all_table_data(db)
