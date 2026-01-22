from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from ..database.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    points = Column(Float, default=2000.0)  # Starting with 2000 points
    negative_points = Column(Float, default=0.0)
    total_earned_points = Column(Float, default=0.0)
    streak_count = Column(Integer, default=0)
    max_streak = Column(Integer, default=0)
    task_slots = Column(Integer, default=10)  # Initial 10 task slots
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Profile data
    profile_data = Column(JSON, default=dict)  # For storing avatars, themes, etc.
    
    def __repr__(self):
        return f"<User(username='{self.username}', points={self.points})>"