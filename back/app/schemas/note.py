from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from app.utils.video import get_video_url


# トレーニング入力用モデル
class TrainingInput(BaseModel):
    training_id: str = Field(...)  # クライアントからはUUIDが文字列として送られてくる
    count: int = Field(..., ge=1)  # トレーニング回数


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


# 選手のホーム画面のノート一覧の情報のオブジェクト
class NoteListItem(BaseModel):
    id: UUID
    created_at: datetime
    theme: str
    assignment: str


# 選手のホーム画面のノート一覧の情報をリスト形式で全て取得
class NoteListResponse(BaseModel):
    items: List[NoteListItem]


# trainingの型定義
class TrainingInfo(BaseModel):
    id: UUID
    menu: str

    class Config:
        from_attributes = True


# ノート詳細画面のTrainingNotesの型定義
class TrainingNoteDetail(BaseModel):
    id: UUID
    training_id: UUID
    note_id: UUID
    count: int
    created_at: datetime
    updated_at: datetime
    training: Optional[TrainingInfo] = None

    class Config:
        from_attributes = True


# ノート詳細画面のレスポンスの型定義
class NoteDetailResponse(BaseModel):
    id: UUID
    user_id: UUID
    theme: str
    assignment: str
    practice_video: Optional[str] = None
    my_video: Optional[str] = None
    my_video_url: Optional[str] = None
    weight: float
    sleep: float
    looked_day: str
    practice: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    training_notes: List[TrainingNoteDetail] = []

    class Config:
        from_attributes = True

    # my_video_urlに値がNoneであった場合でもmy_videoが存在すれば生成することができる
    # 詳細画面のレスポンスではmy_video_urlを記述していないけど、こちらのコードでmy_videoが存在した場合にレスポンスに挿入して返す
    @validator("my_video_url", pre=True, always=True)
    def generate_video_url(cls, v, values):
        """my_videoパスからURLを生成"""
        if not v and values.get("my_video"):
            return get_video_url(values.get("my_video"))
        return v
