from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any


class RankingBase(BaseModel):
    user_id: int
    ranking_type: str  # "points", "negative_points", "streak", "task_specific"
    task_id: Optional[int] = None
    value: float
    rank_position: int


class RankingCreate(RankingBase):
    pass


class RankingUpdate(BaseModel):
    value: Optional[float] = None
    rank_position: Optional[int] = None


class RankingResponse(RankingBase):
    id: int
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserTaskRankingBase(BaseModel):
    user_id: int
    task_template_id: int
    total_earned: float = 0.0
    completion_count: int = 0
    success_rate: float = 0.0


class UserTaskRankingCreate(UserTaskRankingBase):
    pass


class UserTaskRankingUpdate(BaseModel):
    total_earned: Optional[float] = None
    completion_count: Optional[int] = None
    success_rate: Optional[float] = None


class UserTaskRankingResponse(UserTaskRankingBase):
    id: int
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    user_id: int
    username: str
    value: float
    rank_position: int
    
    class Config:
        from_attributes = True


class LeaderboardResponse(BaseModel):
    ranking_type: str
    entries: List[LeaderboardEntry]
    total_participants: int
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserRankingsResponse(BaseModel):
    overall_rank: Optional[int] = None
    points: float = 0.0
    negative_points: float = 0.0
    streak_rank: Optional[int] = None
    streak_count: int = 0
    task_rankings: List[Dict[str, Any]] = []
    
    class Config:
        from_attributes = True