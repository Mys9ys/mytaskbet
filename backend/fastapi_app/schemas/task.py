from pydantic import BaseModel, field_validator
from datetime import datetime
from typing import Optional, List, Literal


Difficulty = Literal["easy", "medium", "hard"]


class TaskTemplateBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None


class TaskTemplateCreate(TaskTemplateBase):
    pass


class TaskTemplateUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None


class TaskTemplateResponse(TaskTemplateBase):
    id: int
    average_bid: float = 0.0
    max_allowed_bid: float = 0.0
    usage_count: int = 0
    fund_balance: int = 0
    completion_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserTaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None


class UserTaskCreate(UserTaskBase):
    difficulty: Difficulty = "easy"
    template_id: Optional[int] = None


class UserTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[Difficulty] = None


class UserTaskResponse(UserTaskBase):
    id: int
    user_id: int
    template_id: Optional[int] = None
    bid_amount: float
    difficulty: Difficulty = "easy"
    outcome: Optional[str] = None
    is_completed: bool = False
    completion_date: Optional[datetime] = None
    streak_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TaskBidHistoryBase(BaseModel):
    task_template_id: int
    user_id: int
    bid_amount: float


class TaskBidHistoryCreate(TaskBidHistoryBase):
    pass


class TaskBidHistoryResponse(TaskBidHistoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
