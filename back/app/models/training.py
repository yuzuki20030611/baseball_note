from .base import Base, ModelBaseMixinWithoutUpdatedAt

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Text

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .training_note import TrainingNotes

    


class Trainings(Base, ModelBaseMixinWithoutUpdatedAt):
    __tablename__ = "trainings"

    menu: Mapped[str] = mapped_column(Text, nullable=False)

    training_notes: Mapped["TrainingNotes"] = relationship(
        "TrainingNotes",
        back_populates="trainings",
        cascade="all, delete-orphan"  # トレーニングが削除されたとき、関連するtraining_notesも削除
    )