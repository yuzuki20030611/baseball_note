from datetime import datetime
from typing import Any
import uuid
from enum import IntEnum, Enum as PyEnum

from sqlalchemy import TIMESTAMP, event, func, orm, String, Integer, Enum, ForeignKey, Text, DECIMAL
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.logger import get_logger

# データベースのテーブルの基本となる共通の設定（ベースモデル）を定義



logger = get_logger(__name__)


class Base(DeclarativeBase):
    pass


class ModelBaseMixin:
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.current_timestamp(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )
    deleted_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=True)


class ModelBaseMixinWithoutDeletedAt:
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.current_timestamp(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )

class ModelBaseMixinWithoutUpdatedAt:
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=func.current_timestamp(),
    )
    
    deleted_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=True)


class UserRole(IntEnum):
    PLAYER = 0
    COACH = 1

class Users(Base, ModelBaseMixin):
    __tablename__ = "users"
    
    # PythonのUUIDオブジェクトとして取り扱う　新規レコード作成時に自動的にUUIDを生成　as_uuid=Trueとunique=Trueは削除しても可
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)


    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[int] = mapped_column(Integer, nullable=False, default=UserRole.PLAYER)  # 0: player, 1: coach

    # 1対1の関係を定義
    profile: Mapped["Profiles"] = relationship(
        "Profiles", 
        back_populates="user", 
        uselist=False,
        cascade="all, delete-orphan"
    )

    comments: Mapped["Comments"] = relationship(
        "Comments",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    notes: Mapped["Notes"] = relationship(
        "Notes",
        back_populates="user",
        cascade="all, delete-orphan"
    )


class Position(str, PyEnum):
    PITCHER = '投手'
    CATCHER = '捕手'
    FIRST = '一塁手'
    SECOND = '二塁手'
    THIRD = '三塁手'
    SHORT = '遊撃手'
    LEFT = '左翼手'
    CENTER = '中堅手'
    RIGHT = '右翼手'

class DominantHand(str, PyEnum):
    RIGHT_RIGHT = '右投げ右打ち'
    RIGHT_LEFT = '右投げ左打ち'
    LEFT_RIGHT = '左投げ右打ち'
    LEFT_LEFT = '左投げ左打ち'
    BOTH_RIGHT = '両投げ右打ち'
    BOTH_LEFT = '両投げ左打ち'
    RIGHT_BOTH = '右投げ両打ち'
    LEFT_BOTH = '左投げ両打ち'
    BOTH_BOTH = '両投げ両打ち'


class Profiles(Base, ModelBaseMixinWithoutDeletedAt):
    __tablename__ = "profiles"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)


    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)


    name: Mapped[str] = mapped_column(String(255), nullable=False)
    team_name: Mapped[str] = mapped_column(String(255), nullable=False)
    birthday: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    player_dominant: Mapped[DominantHand] = mapped_column(
        Enum(DominantHand, name='dominant_hand_type'), 
        nullable=False
    )
    player_position: Mapped[Position] = mapped_column(
        Enum(Position, name='player_position_type'), 
        nullable=False
    )
    admired_player: Mapped[str | None] = mapped_column(String(255), nullable=True)
    introduction: Mapped[str | None] = mapped_column(Text, nullable=True)

    # 1対1の関係を定義
    user: Mapped["Users"] = relationship(
        "Users",
        back_populates="profile",
        uselist=False  # 1対1の関係であることを示す
    )


class Notes(Base, ModelBaseMixin):
    __tablename__ = "notes"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)


    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)


    theme: Mapped[str] = mapped_column(String(255), nullable=False)
    assignment: Mapped[str] = mapped_column(Text, nullable=False)
    practice_video: Mapped[str] = mapped_column(String(255), nullable=True)
    my_video: Mapped[str] = mapped_column(String(255), nullable=True)
    weight: Mapped[float] = mapped_column(DECIMAL(4, 1), nullable=False)
    sleep: Mapped[float] = mapped_column(DECIMAL(3, 1), nullable=False)
    looked_day: Mapped[str] = mapped_column(Text, nullable=False)
    practice: Mapped[str] = mapped_column(Text, nullable=True)

    user: Mapped["Users"] = relationship(
        "Users",
        back_populates="notes"
    )

    comments: Mapped["Comments"] = relationship(
        "Comments",
        back_populates="note"
    )

    training_notes: Mapped["TrainingNotes"] = relationship(
        "TrainingNotes",
        back_populates="notes",
        cascade="all, delete-orphan"  # ノートが削除されたとき、関連するtraining_notesも削除
    )


class Trainings(Base, ModelBaseMixinWithoutUpdatedAt):
    __tablename__ = "trainings"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)


    menu: Mapped[str] = mapped_column(Text, nullable=False)

    training_notes: Mapped["TrainingNotes"] = relationship(
        "TrainingNotes",
        back_populates="training",
        cascade="all, delete-orphan"  # トレーニングが削除されたとき、関連するtraining_notesも削除
    )


class Comments(Base, ModelBaseMixin):
    __tablename__ = "comments"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)


    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    note_id: Mapped[UUID] = mapped_column(ForeignKey("notes.id"), nullable=False)


    content: Mapped[str] = mapped_column(Text, nullable=False)

    user: Mapped["Users"] = relationship(
        "Users",
        back_populates="comments"
    )

    note: Mapped["Notes"] = relationship(
        "Notes",
        back_populates="comments"
    )


class  TrainingNotes(Base, ModelBaseMixin):
    __tablename__ = "training_notes"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True)


    training_id: Mapped[UUID] = mapped_column(ForeignKey("trainings.id"), nullable=False)
    note_id: Mapped[UUID] = mapped_column(ForeignKey("notes.id"), nullable=False)

    
    count: Mapped[int] = mapped_column(Integer, nullable=False)

    notes: Mapped["Notes"] = relationship(
        "Notes",
        back_populates="training_notes"
    )

    training: Mapped["Trainings"] = relationship(
        "Trainings",
        back_populates="training_notes"
    )



@event.listens_for(Session, "do_orm_execute")
def _add_filtering_deleted_at(execute_state: Any) -> None:
    """論理削除用のfilterを自動的に適用する
    以下のようにすると、論理削除済のデータも含めて取得可能
    select(...).filter(...).execution_options(include_deleted=True).
    """
    if (
        execute_state.is_select
        and not execute_state.is_column_load
        and not execute_state.is_relationship_load
        and not execute_state.execution_options.get("include_deleted", False)
    ):
        execute_state.statement = execute_state.statement.options(
            orm.with_loader_criteria(  # ignore[mypy]
                ModelBaseMixin,
                lambda cls: cls.deleted_at.is_(None),
                include_aliases=True,
            ),
        )