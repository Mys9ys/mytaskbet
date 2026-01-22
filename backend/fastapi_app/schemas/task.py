from pydantic import BaseModel, validator
from datetime import datetime
from typing import Optional, List


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
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True


class UserTaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    bid_amount: float


class UserTaskCreate(UserTaskBase):
    template_id: Optional[int] = None
    
    @validator('bid_amount')
    def bid_amount_positive(cls, v):
        if v <= 0:
            raise ValueError('Bid amount must be positive')
        return v


class UserTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    bid_amount: Optional[float] = None


class UserTaskResponse(UserTaskBase):
    id: int
    user_id: int
    template_id: Optional[int] = None
    is_completed: bool = False
    completion_date: Optional[datetime] = None
    streak_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True


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
        orm_mode = True