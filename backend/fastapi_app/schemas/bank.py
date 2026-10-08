from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any


class BankBase(BaseModel):
    total_points: float = 0.0


class BankCreate(BaseModel):
    pass


class BankUpdate(BaseModel):
    total_points: Optional[float] = None


class BankResponse(BaseModel):
    id: int
    total_points: float
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class BankTransactionBase(BaseModel):
    user_id: int
    task_id: int
    amount: float
    transaction_type: str  # "deposit" or "withdrawal"
    description: Optional[str] = None


class BankTransactionCreate(BankTransactionBase):
    pass


class BankTransactionResponse(BankTransactionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class RewardDistributionBase(BaseModel):
    bank_id: int
    distribution_type: str  # "weekly", "monthly", "special"
    total_amount: float
    winners_data: List[Dict[str, Any]]


class RewardDistributionCreate(RewardDistributionBase):
    pass


class RewardDistributionResponse(RewardDistributionBase):
    id: int
    distribution_date: datetime
    
    class Config:
        from_attributes = True


class BankStatusResponse(BaseModel):
    total_points: float
    daily_transactions: int
    weekly_distributions: float
    
    class Config:
        from_attributes = True