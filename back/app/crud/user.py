from sqlalchemy.orm import Session
from app.models.base import Users
from app.schemas.auth import UserCreate
from uuid import UUID


def get_user_by_id(db: Session, user_id: UUID):
    return db.query(Users).filter(Users.id == user_id).first()


def get_user_by_firebase_uid(db: Session, firebase_uid: str):
    return db.query(Users).filter(Users.firebase_uid == firebase_uid).first()


def get_user_by_email(db: Session, email: str):
    return db.query(Users).filter(Users.email == email).first()


def create_user(db: Session, user: UserCreate):
    db_user = Users(firebase_uid=user.firebase_uid, email=user.email, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_role(db: Session, user_id: UUID, role: int):
    db_user = get_user_by_id(db, user_id)

    if db_user:
        db_user.role = role
        db.commit()
        db.refresh(db_user)
    return db_user


def update_user_email(db: Session, firebase_uid: str, new_email: str):
    db_user = get_user_by_firebase_uid(db, firebase_uid)
    if db_user:
        db_user.email = new_email
        db.commit()
        db.refresh(db_user)
    return db_user
