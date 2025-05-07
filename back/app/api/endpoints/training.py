from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.schemas.training import TrainingCreate, TrainingResponse, TrainingList
from app.crud import training as training_crud
from app.core.logger import get_logger


logger = get_logger(__name__)

router = APIRouter()


@router.post(
    "/menu", response_model=TrainingResponse, status_code=status.HTTP_201_CREATED
)
def create_training_menu(training_data: TrainingCreate, db: Session = Depends(get_db)):
    """新しいトレーニングメニューを作成します"""
    return training_crud.create_training(db, training_data)


@router.get("/menu/list", response_model=TrainingList)
def read_training_menu(
    firebase_uid: str = Query(..., description="ユーザーのFirebase UID"),
    db: Session = Depends(get_db),
):
    """自分で追加したトレーニングメニュー一覧を取得します"""
    trainings = training_crud.get_specific_trainings(db, firebase_uid)
    return {"items": trainings}


@router.delete("/menu/{training_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_training_menu(training_id: UUID, db: Session = Depends(get_db)):
    """指定されたIDのトレーニングメニューを削除します"""
    success = training_crud.delete_training(db, training_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="トレーニングメニューが見つかりません",
        )
    return None


@router.get("/menu/all", response_model=TrainingList)
def read_all_training_menus(db: Session = Depends(get_db)):
    """すべてのトレーニングメニューを取得します"""
    trainings = training_crud.get_all_trainings(db)
    return {"items": trainings}
