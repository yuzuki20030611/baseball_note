from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.core.database import get_db
from app.models.base import Users, Profiles, Notes, Trainings, TrainingNotes
from app.core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


# ヘルパー関数: 全テーブル情報の取得
def get_all_table_data(db: Session, limit: int = 5) -> Dict[str, List[Dict[str, Any]]]:
    """
    システム内の全テーブルデータを取得する軽量版ヘルパー関数
    料金対策：各テーブルのデータ件数を制限
    """

    # 全ユーザー情報（最新のみ制限）
    users = []
    user_records = db.query(Users).order_by(Users.created_at.desc()).limit(limit).all()
    for user in user_records:
        users.append(
            {
                "id": str(user.id),
                "firebase_uid": user.firebase_uid,
                "email": user.email,
                "role": user.role,
            }
        )

    # 全プロフィール情報（最新のみ制限）
    profiles = []
    profile_records = (
        db.query(Profiles).order_by(Profiles.created_at.desc()).limit(limit).all()
    )
    for profile in profile_records:
        profiles.append(
            {
                "user_id": str(profile.user_id),
                "name": profile.name,
                "team_name": profile.team_name,
                "position": profile.player_position,
                "dominant_hand": profile.player_dominant,
                "birthday": profile.birthday.isoformat() if profile.birthday else None,
                "admired_player": profile.admired_player,
                # 長いテキストは文字数制限
                "introduction": profile.introduction[:200] + "..."
                if profile.introduction and len(profile.introduction) > 200
                else profile.introduction,
            }
        )

    # 全ノート情報（最新のみ制限 + 文字数制限）
    notes = []
    note_records = db.query(Notes).order_by(Notes.created_at.desc()).limit(limit).all()
    for note in note_records:
        notes.append(
            {
                "id": str(note.id),
                "user_id": str(note.user_id),
                "theme": note.theme,
                # 長いテキストは文字数制限
                "assignment": note.assignment[:300] + "..."
                if note.assignment and len(note.assignment) > 300
                else note.assignment,
                "weight": float(note.weight) if note.weight else None,
                "sleep": float(note.sleep) if note.sleep else None,
                "looked_day": note.looked_day[:200] + "..."
                if note.looked_day and len(note.looked_day) > 200
                else note.looked_day,
                "practice": note.practice[:200] + "..."
                if note.practice and len(note.practice) > 200
                else note.practice,
            }
        )

    # 全トレーニング情報（最新のみ制限 + 文字数制限）
    trainings = []
    training_records = (
        db.query(Trainings).order_by(Trainings.created_at.desc()).limit(limit).all()
    )
    for training in training_records:
        trainings.append(
            {
                "id": str(training.id),
                "user_id": str(training.user_id),
                # メニューの文字数制限
                "menu": training.menu[:200] + "..."
                if training.menu and len(training.menu) > 200
                else training.menu,
            }
        )

    # 全トレーニングノート関連情報（最新のみ制限）
    training_notes = []
    tn_records = (
        db.query(TrainingNotes)
        .order_by(TrainingNotes.created_at.desc())
        .limit(limit)
        .all()
    )
    for tn in tn_records:
        training_notes.append(
            {
                "training_id": str(tn.training_id),
                "note_id": str(tn.note_id),
                "count": tn.count,
            }
        )

    return {
        "users": users,
        "profiles": profiles,
        "notes": notes,
        "trainings": trainings,
        "training_notes": training_notes,
        "_metadata": {
            "limit_applied": limit,
            "note": "料金最適化のため各テーブル最新{}件のみ表示".format(limit),
        },
    }


# 特定ユーザーの関連データ取得
def get_user_related_data(db: Session, user_id: str, limit: int = 5) -> Dict[str, Any]:
    """
    特定ユーザーの関連データを取得する軽量版ヘルパー関数
    """

    # プロフィール情報取得
    my_profile = None
    profile = db.query(Profiles).filter(Profiles.user_id == user_id).first()
    if profile:
        my_profile = {
            "id": str(profile.id),
            "name": profile.name,
            "team_name": profile.team_name,
            "position": profile.player_position,
            "dominant_hand": profile.player_dominant,
            "birthday": profile.birthday.isoformat() if profile.birthday else None,
            "admired_player": profile.admired_player,
            # 長いテキストは文字数制限
            "introduction": profile.introduction[:200] + "..."
            if profile.introduction and len(profile.introduction) > 200
            else profile.introduction,
        }

    # ノート情報取得（最新のみ制限 + 文字数制限）
    my_notes = []
    note_records = (
        db.query(Notes)
        .filter(Notes.user_id == user_id)
        .order_by(Notes.created_at.desc())  # 最新順
        .limit(limit)  # 件数制限
        .all()
    )
    for note in note_records:
        my_notes.append(
            {
                "id": str(note.id),
                "theme": note.theme,
                # 長いテキストは文字数制限（料金対策）
                "assignment": note.assignment[:300] + "..."
                if note.assignment and len(note.assignment) > 300
                else note.assignment,
                "weight": float(note.weight) if note.weight else None,
                "sleep": float(note.sleep) if note.sleep else None,
                "looked_day": note.looked_day[:200] + "..."
                if note.looked_day and len(note.looked_day) > 200
                else note.looked_day,
                "practice": note.practice[:200] + "..."
                if note.practice and len(note.practice) > 200
                else note.practice,
            }
        )

    # トレーニング情報取得（最新のみ制限 + 文字数制限）
    my_trainings = []
    training_records = (
        db.query(Trainings)
        .filter(Trainings.user_id == user_id)
        .order_by(Trainings.created_at.desc())  # 最新順
        .limit(limit)  # 件数制限
        .all()
    )
    for training in training_records:
        my_trainings.append(
            {
                "id": str(training.id),
                # メニューの文字数制限
                "menu": training.menu[:200] + "..."
                if training.menu and len(training.menu) > 200
                else training.menu,
            }
        )

    # トレーニングノート関連情報（最新のみ制限）
    my_training_notes = []
    training_note_records = (
        db.query(TrainingNotes)
        .join(Notes, TrainingNotes.note_id == Notes.id)
        .filter(Notes.user_id == user_id)
        .order_by(TrainingNotes.created_at.desc())  # 最新順
        .limit(limit)  # 件数制限
        .all()
    )
    for tn in training_note_records:
        my_training_notes.append(
            {
                "training_id": str(tn.training_id),
                "note_id": str(tn.note_id),
                "count": tn.count,
            }
        )

    return {
        "profile": my_profile,
        "notes": my_notes,
        "trainings": my_trainings,
        "training_notes": my_training_notes,
        "_metadata": {
            "limit_applied": limit,
            "note": "料金最適化のため各データ最新{}件のみ表示".format(limit),
        },
    }


@router.get("/data", response_model=Dict[str, Any])
async def get_user_data(
    firebase_uid: str = Query(..., description="Firebase UID of the user"),
    limit: int = Query(
        default=5, ge=1, le=50, description="取得件数制限（デフォルト5件、最大50件）"
    ),
    db: Session = Depends(get_db),
):
    """
    特定ユーザーの情報を取得するエンドポイント
    Difyチャットボットで使用します

    料金最適化：
    - デフォルト5件、最大50件まで制限
    - 長いテキストは文字数制限
    - 最新データ優先で取得
    """
    logger.info(f"Dify APIリクエスト: firebase_uid={firebase_uid}, limit={limit}")

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
    }

    # ヘルパー関数を使用してユーザー関連データを取得
    my_data = get_user_related_data(db, user.id, limit)

    return {"current_user": current_user, "my_data": my_data}


@router.get("/all-data", response_model=Dict[str, Any])
async def get_all_data(
    limit: int = Query(
        default=5,
        ge=1,
        le=50,
        description="各テーブルの取得件数制限（デフォルト5件、最大50件）",
    ),
    db: Session = Depends(get_db),
):
    """
    全データを取得するエンドポイント（軽量版）
    Difyチャットボットで使用します

    料金最適化：
    - 各テーブルデフォルト5件、最大50件まで制限
    - 長いテキストは文字数制限
    - 最新データ優先で取得
    """
    logger.info(f"Dify API 全データリクエスト: limit={limit}")

    # ヘルパー関数を使用して全テーブル情報を取得
    return get_all_table_data(db, limit)
