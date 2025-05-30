from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator
from datetime import date, datetime
from typing import Optional
from uuid import UUID
from app.models.base import Position, DominantHand
from app.core.logger import get_logger
from typing import List

# ここでプロフィール作成のリクエスト、レスポンス、更新の型を作成していく/

logger = get_logger(__name__)


# リクエストモデル
class CreateProfile(BaseModel):
    user_id: UUID
    name: str = Field(..., min_length=1, max_length=50, description="名前（50字以内）")
    team_name: str = Field(
        ..., min_length=1, max_length=50, description="チーム名（50字以内）"
    )
    birthday: date = Field(..., description="生年月日")
    player_dominant: DominantHand = Field(..., description="利き手")
    player_position: Position = Field(..., description="ポジション")
    admired_player: Optional[str] = Field(
        None, min_length=1, max_length=50, description="憧れの選手（50字以内）"
    )
    introduction: Optional[str] = Field(
        None, min_length=1, max_length=500, description="自己紹介（500字以内）"
    )
    image_path: Optional[str] = None

    class Config:
        # SQLAlchemyモデルとの互換性を確保
        from_attributes = True
        populate_by_name = True

    @field_validator("birthday")
    @classmethod
    def validate_birthday(cls, v: date) -> date:
        today = date.today()
        min_date = date(1900, 1, 1)

        if v > today:
            raise ValueError("生年月日は今日より前の日付を入力してください")
        if v < min_date:
            raise ValueError("生年月日は1900年以降の日付を入力してください")
        return v


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
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # モデルの設定
    model_config = ConfigDict(
        from_attributes=True,  # SQLAlchemyモデルからの変換を可能にする
        populate_by_name=True,  # 名前でフィールドをマッピング
    )

    # 全ての型定義の検証が終わった後にデータベーに保存しているpathを使用してFirebaseStorageに
    # 保存しているpathから一致するものを取得し、そのpathからURL生成する
    @model_validator(mode="after")
    def generate_image_url(self):
        """image_pathからURLを生成"""
        if self.image_path and not self.image_url:
            from app.utils.image import get_image_url

            self.image_url = get_image_url(self.image_path)

        return self


class ResponseProfileList(BaseModel):
    items: List[ResponseProfile]


# 更新モデル
class UpdateProfile(BaseModel):
    name: Optional[str] = Field(
        None, min_length=1, max_length=50, description="名前（50字以内）"
    )
    team_name: Optional[str] = Field(
        None, min_length=1, max_length=50, description="名前（50字以内）"
    )
    birthday: Optional[date] = Field(None, description="生年月日")
    player_dominant: Optional[DominantHand] = Field(None, description="利き手")
    player_position: Optional[Position] = Field(None, description="ポジション")
    admired_player: Optional[str] = Field(
        None, min_length=1, max_length=50, description="憧れの選手（50字以内）"
    )
    introduction: Optional[str] = Field(
        None, min_length=1, max_length=500, description="自己紹介（500字以内）"
    )
    image_path: Optional[str] = None

    @field_validator("birthday")
    @classmethod
    def validate_birthday(cls, v: Optional[date]) -> Optional[date]:
        if v is None:
            return v

        today = date.today()
        min_date = date(1900, 1, 1)

        if v > today:
            raise ValueError("生年月日は今日より前の日付を入力してください")
        if v < min_date:
            raise ValueError("生年月日は1900年以降の日付を入力してください")
        return v

    model_config = ConfigDict(
        from_attributes=True,
        extra="ignore",  # 未定義のフィールドを無視
    )
