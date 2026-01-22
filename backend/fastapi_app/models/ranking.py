from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from ..database.database import Base


class Ranking(Base):
    __tablename__ = "rankings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ranking_type = Column(String, nullable=False)  # "points", "negative_points", "streak", "task_specific"
    task_id = Column(Integer, nullable=True)  # For task-specific rankings
    value = Column(Float, nullable=False)  # The actual value for ranking
    rank_position = Column(Integer, nullable=False)  # Current position in ranking
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<Ranking(user_id={self.user_id}, type='{self.ranking_type}', value={self.value}, position={self.rank_position})>"


class UserTaskRanking(Base):
    __tablename__ = "user_task_rankings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    task_template_id = Column(Integer, ForeignKey("task_templates.id"), nullable=False)
    total_earned = Column(Float, default=0.0)  # Total points earned on this specific task type
    completion_count = Column(Integer, default=0)  # Number of times completed
    success_rate = Column(Float, default=0.0)  # Percentage of successful completions
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<UserTaskRanking(user_id={self.user_id}, task_id={self.task_template_id}, earned={self.total_earned})>"