from sqlalchemy import Column, Integer, Float, DateTime, String, JSON
from sqlalchemy.sql import func
from ..database.database import Base


class Bank(Base):
    __tablename__ = "bank"
    
    id = Column(Integer, primary_key=True, index=True)
    total_points = Column(Float, default=0.0)  # Total points in the application bank
    distribution_history = Column(JSON, default=list)  # History of distributions
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Bank(total_points={self.total_points})>"


class BankTransaction(Base):
    __tablename__ = "bank_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    task_id = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String, nullable=False)  # "deposit" or "withdrawal"
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<BankTransaction(user_id={self.user_id}, amount={self.amount}, type='{self.transaction_type}')>"


class RewardDistribution(Base):
    __tablename__ = "reward_distributions"
    
    id = Column(Integer, primary_key=True, index=True)
    bank_id = Column(Integer, nullable=False)
    distribution_type = Column(String, nullable=False)  # "weekly", "monthly", "special"
    total_amount = Column(Float, nullable=False)
    winners_data = Column(JSON, nullable=False)  # List of {user_id, amount}
    distribution_date = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<RewardDistribution(type='{self.distribution_type}', amount={self.total_amount})>"