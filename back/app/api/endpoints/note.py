from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import json

from app.core.database import get_async_db
from app.schemas.note import NoteResponse
from app.crud import note as note_crud
from app.utils.video import validate_video, save_note_video
from app.core.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.post(
    "/create", response_model=NoteResponse, status_code=status.HTTP_201_CREATED
)
async def create_note(
    firebase_uid: str = Form(...),
    theme: str = Form(...),
    assignment: str = Form(...),
    weight: float = Form(...),
    sleep: float = Form(...),
    looked_day: str = Form(...),
    practice_video: Optional[str] = Form(""),
    practice: Optional[str] = Form(""),
    trainings: str = Form(...),  # JSONデータが文字列として送信される
    my_video: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_async_db),
):
    """野球ノートを新規作成する"""
    try:
        # ユーザーの取得
        user = await note_crud.get_user_by_firebase_uid(db, firebase_uid)
        if not user:
            logger.warning(f"ユーザーが見つかりません: {firebase_uid}")
            raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

        # 動画ファイルの処理
        video_path = None
        if my_video:
            await validate_video(my_video)
            video_path = await save_note_video(my_video)

        # FormDataから受け取ったデータの整形
        note_data = {
            "theme": theme,
            "assignment": assignment,
            "practice_video": practice_video if practice_video else None,
            "weight": weight,
            "sleep": sleep,
            "looked_day": looked_day,
            "practice": practice if practice else None,
            "trainings": trainings,  # 文字列のまま渡してCRUD内でパースする
        }

        # ノートの作成
        created_note = await note_crud.create_note(
            db=db, user_id=user.id, note_data=note_data, video_path=video_path
        )

        # SQLAlchemyモデルを直接変換するのではなく、
        # トレーニングノートを別途取得して辞書を作成
        from sqlalchemy import select
        from app.models.base import TrainingNotes

        # トレーニングノートを明示的に取得
        stmt = select(TrainingNotes).where(TrainingNotes.note_id == created_note.id)
        result = await db.execute(stmt)
        training_notes = result.scalars().all()

        # 手動でレスポンス用の辞書を構築
        response_dict = {
            "id": created_note.id,
            "user_id": created_note.user_id,
            "theme": created_note.theme,
            "assignment": created_note.assignment,
            "practice_video": created_note.practice_video,
            "my_video": created_note.my_video,
            "weight": created_note.weight,
            "sleep": created_note.sleep,
            "looked_day": created_note.looked_day,
            "practice": created_note.practice,
            "created_at": created_note.created_at,
            "updated_at": created_note.updated_at,
            # トレーニングノートを明示的に変換
            "training_notes": [
                {
                    "id": tn.id,
                    "training_id": tn.training_id,
                    "note_id": tn.note_id,
                    "count": tn.count,
                    "created_at": tn.created_at,
                    "updated_at": tn.updated_at,
                }
                for tn in training_notes
            ],
        }

        # 辞書からPydanticモデルを生成
        response_data = NoteResponse.model_validate(response_dict)

        return response_data

    except json.JSONDecodeError:
        logger.error("トレーニングデータのJSON解析エラー")
        raise HTTPException(
            status_code=400, detail="トレーニングデータの形式が不正です"
        )
    except ValueError as e:
        logger.error(f"値エラー: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"ノート作成エラー: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="サーバーエラーが発生しました")
