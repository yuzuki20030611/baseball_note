from .base import Base, ModelBaseMixin

from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from uuid import UUID

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .note import Notes
    from .training import Trainings
    
    

class  TrainingNotes(Base, ModelBaseMixin):
    __tablename__ = "training_notes"

    training_id: Mapped[UUID] = mapped_column(ForeignKey("trainings.id"), nullable=False)
    note_id: Mapped[UUID] = mapped_column(ForeignKey("notes.id"), nullable=False)
    count: Mapped[int] = mapped_column(Integer, nullable=False)

    note: Mapped["Notes"] = relationship(
        "Notes",
        back_populates="training_notes"
    )

    training: Mapped["Trainings"] = relationship(
        "Trainings",
        back_populates="training_notes"
    )