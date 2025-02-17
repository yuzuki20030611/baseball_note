from .base import Base, ModelBaseMixinWithoutDeletedAt

from sqlalchemy.orm import Mapped, mapped_column, relationship   # データベースカラム用
from sqlalchemy import String, TIMESTAMP, Text, Enum, ForeignKey

from datetime import datetime
from enum import Enum as PyEnum  # Python列挙型定義用
from uuid import UUID

from typing import TYPE_CHECKING  # 追加

if TYPE_CHECKING:  # 追加
    from .user import Users

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

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    team_name: Mapped[str] = mapped_column(String(255), nullable=False)
    birthday: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    dominant_hand: Mapped[DominantHand] = mapped_column(Enum(DominantHand), nullable=False)
    position: Mapped[Position] = mapped_column(Enum(Position), nullable=False)
    admired_player: Mapped[str] = mapped_column(String(255), nullable=True)
    introduction: Mapped[str] = mapped_column(Text, nullable=True)

    # 1対1の関係を定義
    user: Mapped["Users"] = relationship(
        "Users",
        back_populates="profile",
        uselist=False  # 1対1の関係であることを示す
    )