from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from uuid import UUID


class TrainingBase(BaseModel):
    menu: str = Field(..., min_length=2, max_length=100)


class TrainingCreate(TrainingBase):
    firebase_uid: str = Field(...)
    pass


class TrainingInDB(TrainingBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class TrainingResponse(TrainingInDB):
    pass


class TrainingList(BaseModel):
    items: List[TrainingResponse]
