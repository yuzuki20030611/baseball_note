from uuid import UUID

from sqlalchemy import ForeignKey, String, Text, DECIMAL
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, ModelBaseMixin

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .user import Users
    from .comment import Comments
    from .training_note import TrainingNotes
    


class Notes(Base, ModelBaseMixin):
    __tablename__ = "notes"

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

    comment: Mapped["Comments"] = relationship(
        "Comments",
        back_populates="notes"
    )

    training_notes: Mapped["TrainingNotes"] = relationship(
        "TrainingNotes",
        back_populates="notes",
        cascade="all, delete-orphan"  # ノートが削除されたとき、関連するtraining_notesも削除
    )

