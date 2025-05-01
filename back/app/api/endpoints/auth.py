from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.schemas.auth import UserCreate, UserResponse, UserRoleResponse, UserEmailUpdate
from app.crud import user as user_crud

import logging

# ロガーの設定
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


router = APIRouter()


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Annotated[Session, Depends(get_db)]):
    # 以下の処理を行う前に、必要なオブジェクトがすべて正しい型であることを確認
    if not isinstance(db, Session):
        logger.error(f"Invalid db type: {type(db)}")
        raise HTTPException(
            status_code=500, detail="Internal server error: Invalid db session"
        )

    db_user = user_crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    db_user = user_crud.get_user_by_firebase_uid(db, user.firebase_uid)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Firebase Uid already registered",
        )

    return user_crud.create_user(db, user)


@router.get("/users/firebase/{firebase_uid}", response_model=UserResponse)
def get_user_by_firebase_uid(
    firebase_uid: str, db: Annotated[Session, Depends(get_db)]
):
    db_user = user_crud.get_user_by_firebase_uid(db, firebase_uid)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return db_user


@router.get("/users/firebase/{firebase_uid}/role", response_model=UserRoleResponse)
def get_user_role_by_firebase_uid(
    firebase_uid: str, db: Annotated[Session, Depends(get_db)]
):
    db_user = user_crud.get_user_by_firebase_uid(db, firebase_uid)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return {"role": db_user.role}


@router.put("/users/email", response_model=UserResponse)
def update_user_email_endpoint(
    email_update: UserEmailUpdate, db: Annotated[Session, Depends(get_db)]
):
    db_user = user_crud.get_user_by_firebase_uid(db, email_update.firebase_uid)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # メールアドレスの重複チェック（同じユーザーの場合はスキップ）
    existing_user = user_crud.get_user_by_email(db, email_update.new_email)
    if existing_user and existing_user.id != db_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use"
        )
    updated_user = user_crud.update_user_email(
        db, email_update.firebase_uid, email_update.new_email
    )
    return updated_user
