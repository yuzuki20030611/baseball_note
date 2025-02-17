from .base import Base, ModelBaseMixin

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Text

from uuid import UUID

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .note import Notes
    from .user import Users


class Comments(Base, ModelBaseMixin):
    __tablename__ = "comments"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    note_id: Mapped[UUID] = mapped_column(ForeignKey("notes.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    user: Mapped["Users"] = relationship(
        "Users",
        back_populates="comments"
    )

    note: Mapped["Notes"] = relationship(
        "Notes",
        back_populates="comments",
        cascade="all, delete-orphan"
    )