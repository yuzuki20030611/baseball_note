from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Form,
    File,
    UploadFile,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session, joinedload

from typing import Optional
import json

from app.core.database import get_async_db, get_db
from app.schemas.note import NoteResponse, NoteListResponse, NoteDetailResponse
from app.crud import note as note_crud
from app.crud import user as user_crud
from app.models.base import TrainingNotes, Users
from app.utils.video import validate_video, save_note_video
from app.core.logger import get_logger
from app.utils.video import delete_note_video

from uuid import UUID

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
        user = await user_crud.get_user_by_firebase_uid_async(db, firebase_uid)
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


@router.get("/get/{firebase_uid}", response_model=NoteListResponse)
def get_user_notes(
    firebase_uid: str,
    db: Session = Depends(get_db),
):
    """自分で作成したノートの一覧を取得します"""
    try:
        # ユーザーの取得
        user = user_crud.get_user_by_firebase_uid(db, firebase_uid)
        if not user:
            logger.warning(f"ユーザーが見つかりません: {firebase_uid}")
            raise HTTPException(status_code=404, detail="ユーザーが見つかりません")

        notes = note_crud.get_note(db, user.id)
        return {"items": notes}
    except Exception as e:
        logger.error(f"ノート取得エラー:{str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"ノート取得中にエラーが発生しました: {str(e)}"
        )


@router.get("/user/{user_id}", response_model=NoteListResponse)
def get_users_notes_by_user_id(
    user_id: UUID,
    db: Session = Depends(get_db),
):
    """user_idと一致するノートの一覧を取得します"""
    try:
        user = db.query(Users).filter(Users.id == user_id).first()
        if not user:
            logger.warning(f"{user_id}: idに該当するユーザーが見つかりません")
            return {"items": []}
        notes = note_crud.get_note(db, user_id)
        return {"items": notes}
    except Exception as e:
        logger.info(f"ノート一覧取得に失敗しました: {str(e)}", exc_info=True)
        return {"items": []}


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: UUID, db: Session = Depends(get_db)):
    """指定されたIDのノートを論理削除します"""
    success = note_crud.delete_note(db, note_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="ノートが見つかりません"
        )
    return None


@router.get("/detail/{note_id}", response_model=NoteDetailResponse)
def get_note_detail(note_id: UUID, db: Session = Depends(get_db)):
    """ノートの詳細情報を取得します"""
    try:
        # ノート詳細の取得
        note_detail = note_crud.get_note_detail(db, note_id)
        if not note_detail:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="ノートが見つかりません"
            )
        # トレーニングデータを別途取得（確実に全件取得するため）
        # joinして、TrainingNotes テーブルと、それとリレーションを持つ training テーブルを内部結合して、一緒に情報を取得する
        training_notes = (
            db.query(TrainingNotes)
            .join(TrainingNotes.training)
            .filter(TrainingNotes.note_id == note_id)
            .all()
        )

        response_data = {
            "id": note_detail.id,
            "user_id": note_detail.user_id,
            "theme": note_detail.theme,
            "assignment": note_detail.assignment,
            "practice_video": note_detail.practice_video,
            "my_video": note_detail.my_video,
            "weight": note_detail.weight,
            "sleep": note_detail.sleep,
            "looked_day": note_detail.looked_day,
            "practice": note_detail.practice,
            "created_at": note_detail.created_at,
            "updated_at": note_detail.updated_at,
            "training_notes": [
                {
                    "id": tn.id,
                    "training_id": tn.training_id,
                    "note_id": tn.note_id,
                    "count": tn.count,
                    "created_at": tn.created_at,
                    "updated_at": tn.updated_at,
                    "training": {"id": tn.training.id, "menu": tn.training.menu}
                    if tn.training
                    else None,
                }
                for tn in training_notes
            ],
        }

        return NoteDetailResponse.model_validate(response_data)
    except Exception as e:
        logger.error(f"ノート詳細取得エラー: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ノート詳細取得中にエラーが発生しました: {str(e)}",
        )


@router.put("/{note_id}", response_model=NoteDetailResponse)
async def update_note(
    note_id: UUID,
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
    delete_video: bool = Form(False),
    db: AsyncSession = Depends(get_async_db),
):
    """野球ノートを更新する"""
    try:
        # ユーザーの取得と認証
        user = await user_crud.get_user_by_firebase_uid_async(db, firebase_uid)
        if not user:
            logger.warning(f"ユーザーが見つかりません: {firebase_uid}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="ユーザーが見つかりません"
            )

        # ノートの存在確認と所有権チェック(dbを非同期処理で行っているので、こちらの取得方法も非同期処理で統一している。)
        note = await note_crud.get_note_detail_async(db, note_id)
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="ノートが見つかりません"
            )

        if note.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="このノートを編集する権限がありません",
            )

        # 動画ファイルの処理
        video_path = note.my_video  # もともと存在していた動画のパス

        # 新しく送信された動画のパスがあった場合
        if my_video:
            await validate_video(my_video)

            # 既存の動画がある場合は削除
            if note.my_video:
                await delete_note_video(note.my_video)
                pass

            # 新しい動画を保存
            video_path = await save_note_video(my_video)

        # 動画削除フラグがあり、動画を削除する場合
        elif delete_video:
            # もともと存在していた動画のパスが存在した場合、削除
            if note.my_video:
                await delete_note_video(note.my_video)
                pass
            video_path = None

        # FormDataから受け取ったデータの整形
        # フロントから送信する際にtrainingsをJSON.stringifyしているのでパースしないといけない
        note_data = {
            "theme": theme,
            "assignment": assignment,
            "practice_video": practice_video if practice_video else None,
            "my_video": video_path,
            "weight": weight,
            "sleep": sleep,
            "looked_day": looked_day,
            "practice": practice if practice else None,
            "trainings": trainings,  # 文字列のまま渡してCRUD内でパースする
        }

        # ノートの更新
        updated_note = await note_crud.update_note(
            db=db, note_id=note_id, note_data=note_data
        )
        # レスポンスデータの構築（get_note_detailと同様の方法で）
        from sqlalchemy import select
        from app.models.base import TrainingNotes

        # トレーニングノートを明示的に取得（updated_noteにトレーニングはリターンされていないため、手動で取得してレスポンスに挿入する）
        stmt = (
            select(TrainingNotes)
            .options(joinedload(TrainingNotes.training))
            .where(TrainingNotes.note_id == note_id)
        )
        result = await db.execute(stmt)
        training_notes = result.unique().scalars().all()

        response_data = {
            "id": updated_note.id,
            "user_id": updated_note.user_id,
            "theme": updated_note.theme,
            "assignment": updated_note.assignment,
            "practice_video": updated_note.practice_video,
            "my_video": updated_note.my_video,
            "weight": updated_note.weight,
            "sleep": updated_note.sleep,
            "looked_day": updated_note.looked_day,
            "practice": updated_note.practice,
            "created_at": updated_note.created_at,
            "updated_at": updated_note.updated_at,
            "training_notes": [
                {
                    "id": tn.id,
                    "training_id": tn.training_id,
                    "note_id": tn.note_id,
                    "count": tn.count,
                    "created_at": tn.created_at,
                    "updated_at": tn.updated_at,
                    "training": {"id": tn.training.id, "menu": tn.training.menu}
                    if tn.training
                    else None,
                }
                for tn in training_notes
            ],
        }

        return NoteDetailResponse.model_validate(response_data)
    except json.JSONDecodeError:
        logger.error("トレーニングデータのJSON解析エラー")
        raise HTTPException(
            status_code=400, detail="トレーニングデータの形式が不正です"
        )
    except ValueError as e:
        logger.error(f"値エラー: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"ノート更新エラー: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"ノート更新中にエラーが発生しました: {str(e)}"
        )
