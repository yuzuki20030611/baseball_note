from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from uuid import UUID


class UserCreate(BaseModel):
    firebase_uid: str
    email: EmailStr
    role: int = Field(0, ge=0, le=1)


class UserResponse(BaseModel):
    id: UUID
    firebase_uid: str
    email: str
    role: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserRoleResponse(BaseModel):
    role: int

    class Config:
        from_attributes = True


class UserEmailUpdate(BaseModel):
    firebase_uid: str
    new_email: EmailStr
