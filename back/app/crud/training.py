from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.models.base import Trainings
from app.schemas.training import TrainingCreate


def create_training(db: Session, training: TrainingCreate) -> Trainings:
    # これはクラスのインスタンス化です
    db_training = Trainings(menu=training.menu)
    db.add(db_training)
    db.commit()
    db.refresh(db_training)
    return db_training


def get_all_trainings(db: Session) -> List[Trainings]:
    return db.query(Trainings).all()


def delete_training(db: Session, training_id: UUID) -> bool:
    db_training = db.query(Trainings).filter(Trainings.id == training_id).first()
    if not db_training:
        return False

    db.delete(db_training)
    db.commit()
    return True
