from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.models.base import Trainings, Users
from app.schemas.training import TrainingCreate


def create_training(db: Session, training_data: TrainingCreate) -> Trainings:
    user = (
        db.query(Users).filter(Users.firebase_uid == training_data.firebase_uid).first()
    )
    if not user:
        return None
    # これはクラスのインスタンス化です
    db_training = Trainings(menu=training_data.menu, user_id=user.id)
    db.add(db_training)
    db.commit()
    db.refresh(db_training)
    return db_training


def get_specific_trainings(db: Session, firebase_uid: str) -> List[Trainings]:
    user = db.query(Users).filter(Users.firebase_uid == firebase_uid).first()
    return db.query(Trainings).filter(Trainings.user_id == user.id).all()


def delete_training(db: Session, training_id: UUID) -> bool:
    db_training = db.query(Trainings).filter(Trainings.id == training_id).first()
    if not db_training:
        return False

    db.delete(db_training)
    db.commit()
    return True
