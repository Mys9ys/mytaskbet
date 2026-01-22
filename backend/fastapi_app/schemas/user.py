from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional, Dict, Any


class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str
    
    @validator('username')
    def username_alphanumeric(cls, v):
        assert v.isalnum(), 'must be alphanumeric'
        return v
    
    @validator('password')
    def password_strength(cls, v):
        assert len(v) >= 6, 'password too short'
        return v


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserInDB(UserBase):
    id: int
    points: float = 2000.0
    negative_points: float = 0.0
    total_earned_points: float = 0.0
    streak_count: int = 0
    max_streak: int = 0
    task_slots: int = 10
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None
    profile_data: Dict[str, Any] = {}
    
    class Config:
        orm_mode = True


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    points: float
    negative_points: float
    total_earned_points: float
    streak_count: int
    max_streak: int
    task_slots: int
    created_at: datetime
    profile_data: Dict[str, Any]
    
    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None