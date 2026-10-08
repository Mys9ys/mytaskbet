from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from ..database.database import Base


class TaskTemplate(Base):
    __tablename__ = "task_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String)
    category = Column(String, index=True)
    average_bid = Column(Float, default=0.0)  # Community average bid
    max_allowed_bid = Column(Float, default=0.0)  # average_bid * 1.2
    usage_count = Column(Integer, default=0)  # How many times this template was used
    fund_balance = Column(Integer, default=0)
    completion_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<TaskTemplate(title='{self.title}', average_bid={self.average_bid})>"


class UserTask(Base):
    __tablename__ = "user_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("task_templates.id"))
    title = Column(String, nullable=False)
    description = Column(String)
    category = Column(String, index=True)
    bid_amount = Column(Float, nullable=False)  # Reserved stake
    difficulty = Column(String, default="easy", nullable=False)
    outcome = Column(String, nullable=True)  # success | failed
    is_completed = Column(Boolean, default=False)
    completion_date = Column(DateTime(timezone=True))
    streak_count = Column(Integer, default=0)  # Consecutive completions
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<UserTask(title='{self.title}', bid_amount={self.bid_amount}, completed={self.is_completed})>"


class TaskBidHistory(Base):
    __tablename__ = "task_bid_history"
    
    id = Column(Integer, primary_key=True, index=True)
    task_template_id = Column(Integer, ForeignKey("task_templates.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bid_amount = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<TaskBidHistory(task_id={self.task_template_id}, user_id={self.user_id}, bid_amount={self.bid_amount})>"