from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.core.database import get_db
from app.models.base import Users, Profiles, Notes, Trainings, TrainingNotes
from app.core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


# ヘルパー関数: 全テーブル情報の取得
def get_all_table_data(db: Session) -> Dict[str, List[Dict[str, Any]]]:
    """システム内の全テーブルデータを取得するヘルパー関数"""

    # 全ユーザー情報
    users = []
    user_records = db.query(Users).all()
    for user in user_records:
        users.append(
            {
                "id": str(user.id),
                "firebase_uid": user.firebase_uid,
                "email": user.email,
                "role": user.role,
                "created_at": user.created_at.isoformat(),
                "updated_at": user.updated_at.isoformat(),
            }
        )

    # 全プロフィール情報
    profiles = []
    profile_records = db.query(Profiles).all()
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
                "created_at": profile.created_at.isoformat(),
                "updated_at": profile.updated_at.isoformat(),
            }
        )

    # 全ノート情報
    notes = []
    note_records = db.query(Notes).all()
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
                "created_at": note.created_at.isoformat(),
                "updated_at": note.updated_at.isoformat(),
            }
        )

    # 全トレーニング情報
    trainings = []
    training_records = db.query(Trainings).all()
    for training in training_records:
        trainings.append(
            {
                "id": str(training.id),
                "user_id": str(training.user_id),
                "menu": training.menu,
                "created_at": training.created_at.isoformat(),
            }
        )

    # 全トレーニングノート関連情報
    training_notes = []
    tn_records = db.query(TrainingNotes).all()
    for tn in tn_records:
        training_notes.append(
            {
                "id": str(tn.id),
                "training_id": str(tn.training_id),
                "note_id": str(tn.note_id),
                "count": tn.count,
                "created_at": tn.created_at.isoformat(),
                "updated_at": tn.updated_at.isoformat(),
            }
        )

    return {
        "users": users,
        "profiles": profiles,
        "notes": notes,
        "trainings": trainings,
        "training_notes": training_notes,
    }


# 特定ユーザーの関連データ取得
def get_user_related_data(db: Session, user_id: str) -> Dict[str, Any]:
    """特定ユーザーの関連データを取得するヘルパー関数"""

    # プロフィール情報取得
    my_profile = None
    profile = db.query(Profiles).filter(Profiles.user_id == user_id).first()
    if profile:
        my_profile = {
            "id": str(profile.id),
            "user_id": str(profile.user_id),
            "name": profile.name,
            "team_name": profile.team_name,
            "position": profile.player_position,
            "dominant_hand": profile.player_dominant,
            "birthday": profile.birthday.isoformat() if profile.birthday else None,
            "admired_player": profile.admired_player,
            "introduction": profile.introduction,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat(),
        }

    # ノート情報取得
    my_notes = []
    note_records = db.query(Notes).filter(Notes.user_id == user_id).all()
    for note in note_records:
        my_notes.append(
            {
                "id": str(note.id),
                "user_id": str(note.user_id),
                "theme": note.theme,
                "assignment": note.assignment,
                "weight": float(note.weight) if note.weight else None,
                "sleep": float(note.sleep) if note.sleep else None,
                "looked_day": note.looked_day,
                "practice": note.practice,
                "created_at": note.created_at.isoformat(),
                "updated_at": note.updated_at.isoformat(),
            }
        )

    # トレーニング情報取得
    my_trainings = []
    training_records = db.query(Trainings).filter(Trainings.user_id == user_id).all()
    for training in training_records:
        my_trainings.append(
            {
                "id": str(training.id),
                "user_id": str(training.user_id),
                "menu": training.menu,
                "created_at": training.created_at.isoformat(),
            }
        )

    # トレーニングノート関連情報
    my_training_notes = []
    training_note_records = (
        db.query(TrainingNotes)
        .join(Notes, TrainingNotes.note_id == Notes.id)
        .filter(Notes.user_id == user_id)
        .all()
    )
    for tn in training_note_records:
        my_training_notes.append(
            {
                "id": str(tn.id),
                "training_id": str(tn.training_id),
                "note_id": str(tn.note_id),
                "count": tn.count,
                "created_at": tn.created_at.isoformat(),
                "updated_at": tn.updated_at.isoformat(),
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
    logger.info(f"Dify APIリクエスト: firebase_uid={firebase_uid}")

    # ユーザーが存在するか確認
    user = db.query(Users).filter(Users.firebase_uid == firebase_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 現在のユーザー情報
    current_user = {
        "id": str(user.id),
        "firebase_uid": user.firebase_uid,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at.isoformat(),
    }

    # ヘルパー関数を使用してユーザー関連データを取得
    my_data = get_user_related_data(db, user.id)

    return {"current_user": current_user, "my_data": my_data}


@router.get("/all-data", response_model=Dict[str, Any])
async def get_all_data(db: Session = Depends(get_db)):
    """
    全データを取得するエンドポイント
    Difyチャットボットで使用します
    """
    logger.info("Dify API 全データリクエスト")

    # ヘルパー関数を使用して全テーブル情報を取得
    return get_all_table_data(db)
