from .base import Base, ModelBaseMixin

from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from enum import IntEnum

from typing import TYPE_CHECKING  # 追加

if TYPE_CHECKING:  # 追加
    from .profile import Profiles  # ここに移動
    from .comment import Comments
    from .note import Notes


class UserRole(IntEnum):
    PLAYER = 0
    COACH = 1


class Users(Base, ModelBaseMixin):
    __tablename__ = "users"
    
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