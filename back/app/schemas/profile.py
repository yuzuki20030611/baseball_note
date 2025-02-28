from pydantic import BaseModel, Field, ConfigDict
from datetime import date, datetime
from typing import Optional
from uuid import UUID
from app.models.base import Position, DominantHand

# ここでプロフィール作成のリクエスト、レスポンス、更新の型を作成していく/

# リクエストモデル
class CreateProfile(BaseModel):
    user_id: UUID
    name: str = Field(max_length=255)
    team_name: str = Field(max_length=255)
    birthday: date
    player_dominant: DominantHand
    player_position: Position
    admired_player: Optional[str] = Field(None, max_length=255)
    introduction: Optional[str] = None
    image_path: Optional[str] = None

# レスポンスモデル
class ResponseProfile(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    team_name: str
    birthday: datetime
    player_dominant: DominantHand
    player_position: Position
    admired_player: Optional[str] = None
    introduction: Optional[str] = None
    image_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    # モデルの設定
    model_config = ConfigDict(
        from_attributes=True,  # SQLAlchemyモデルからの変換を可能にする
        populate_by_name=True  # 名前でフィールドをマッピング
    )
# 更新モデル
class UpdateProfile(BaseModel):
    name: Optional[str] = Field(max_length=255)
    team_name: Optional[str] = Field(max_length=255)
    birthday: Optional[date] = None
    player_dominant: Optional[DominantHand] = None
    player_position: Optional[Position] = None
    admired_player: Optional[str] = Field(None, max_length=255)
    introduction: Optional[str] = None
    image_path: Optional[str] = None
    
    model_config = ConfigDict(
        from_attributes=True,
        extra="ignore"  # 未定義のフィールドを無視
    )