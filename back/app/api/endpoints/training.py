from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
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
def create_training_menu(menu: TrainingCreate, db: Session = Depends(get_db)):
    """新しいトレーニングメニューを作成します"""
    return training_crud.create_training(db, menu)


@router.get("/menu", response_model=TrainingList)
def read_training_menu(db: Session = Depends(get_db)):
    """全てのトレーニングメニュー一覧を取得します"""
    trainings = training_crud.get_all_trainings(db)
    total = training_crud.get_trainings_count(db)
    return {"items": trainings, "total": total}


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
