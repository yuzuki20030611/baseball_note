from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID


# トレーニング入力用モデル
class TrainingInput(BaseModel):
    training_id: str = Field(...)  # クライアントからはUUIDが文字列として送られてくる
    count: int = Field(..., ge=1)  # トレーニング回数


# # ノート作成リクエスト用モデル
# class NoteCreate(BaseModel):
#     firebase_uid: str
#     theme: str = Field(..., min_length=1, max_length=255)
#     assignment: str = Field(..., min_length=1)
#     practice_video: Optional[str] = None
#     weight: float = Field(..., gt=0, le=999.9)
#     sleep: float = Field(..., gt=0, le=99.9)
#     looked_day: str = Field(..., min_length=1)
#     practice: Optional[str] = None
#     trainings: List[TrainingInput] = []


# レスポンス用のトレーニングモデル
class TrainingNoteResponse(BaseModel):
    id: UUID
    training_id: UUID
    note_id: UUID
    count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ノートレスポンス用モデル
class NoteResponse(BaseModel):
    id: UUID
    user_id: UUID
    theme: str
    assignment: str
    practice_video: Optional[str] = None
    my_video: Optional[str] = None
    weight: float
    sleep: float
    looked_day: str
    practice: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    training_notes: List[TrainingNoteResponse] = []

    class Config:
        from_attributes = True


class NoteListItem(BaseModel):
    id: UUID
    created_at: datetime
    theme: str
    assignment: str


class NoteListResponse(BaseModel):
    items: List[NoteListItem]
