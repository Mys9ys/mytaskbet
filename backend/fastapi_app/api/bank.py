from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional

# Local imports
from fastapi_app.models.bank import Bank, BankTransaction, RewardDistribution
from fastapi_app.models.user import User
from fastapi_app.schemas.bank import BankResponse, BankTransactionResponse, RewardDistributionResponse, BankStatusResponse
from fastapi_app.database.database import get_db
from fastapi_app.utils.security import get_current_user

router = APIRouter()

@router.get("/", response_model=BankResponse)
def get_bank_info(db: Session = Depends(get_db)):
    """
    Get bank information
    """
    bank = db.query(Bank).first()
    if not bank:
        bank = Bank(total_points=0)
        db.add(bank)
        db.commit()
        db.refresh(bank)
    return bank

@router.get("/transactions", response_model=List[BankTransactionResponse])
def get_bank_transactions(
    user_id: Optional[int] = None,
    transaction_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user)
):
    """
    Get bank transactions with filters
    """
    query = db.query(BankTransaction)
    
    if user_id:
        query = query.filter(BankTransaction.user_id == user_id)
    
    if transaction_type:
        query = query.filter(BankTransaction.transaction_type == transaction_type)
    
    if start_date:
        query = query.filter(BankTransaction.created_at >= start_date)
    
    if end_date:
        query = query.filter(BankTransaction.created_at <= end_date)
    
    # For security, users can only see their own transactions unless they are admin
    # In this basic version, we'll allow users to see only their transactions
    user = db.query(User).filter(User.username == token_data.username).first()
    if user:
        query = query.filter(BankTransaction.user_id == user.id)
    
    return query.all()

@router.get("/status", response_model=BankStatusResponse)
def get_bank_status(db: Session = Depends(get_db)):
    """
    Get bank status and statistics
    """
    bank = db.query(Bank).first()
    if not bank:
        bank = Bank(total_points=0)
        db.add(bank)
        db.commit()
        db.refresh(bank)
    
    # Calculate daily transactions
    yesterday = datetime.utcnow() - timedelta(days=1)
    daily_transactions = db.query(BankTransaction).filter(
        BankTransaction.created_at >= yesterday
    ).count()
    
    # Calculate weekly distributions
    last_week = datetime.utcnow() - timedelta(weeks=1)
    weekly_distributions = db.query(RewardDistribution).filter(
        RewardDistribution.distribution_date >= last_week
    ).with_entities(RewardDistribution.total_amount).scalar() or 0
    
    return {
        "total_points": bank.total_points,
        "daily_transactions": daily_transactions,
        "weekly_distributions": weekly_distributions
    }

@router.post("/distribute-rewards", response_model=RewardDistributionResponse)
def distribute_rewards(
    distribution_type: str = "weekly",
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user)
):
    """
    Distribute rewards from bank to top users
    """
    # This would typically be an admin-only operation
    # For now, we'll implement the logic
    
    bank = db.query(Bank).first()
    if not bank or bank.total_points == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No points available in bank for distribution"
        )
    
    # Determine distribution amount (e.g., 50% of bank for weekly distribution)
    distribution_percent = 0.5 if distribution_type == "weekly" else 0.3
    distribution_amount = bank.total_points * distribution_percent
    
    if distribution_amount < 1:  # Minimum distribution
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough points in bank for distribution"
        )
    
    # Find top users (simplified: top by points)
    top_users = db.query(User).order_by(User.points.desc()).limit(10).all()
    
    if not top_users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No users found for distribution"
        )
    
    # Calculate rewards (more points = more reward)
    total_user_points = sum(user.points for user in top_users)
    winners_data = []
    
    for user in top_users:
        user_share = (user.points / total_user_points) if total_user_points > 0 else 1/len(top_users)
        user_reward = int(distribution_amount * user_share)
        
        if user_reward > 0:
            user.points += user_reward
            winners_data.append({
                "user_id": user.id,
                "username": user.username,
                "reward": user_reward
            })
    
    # Update bank
    bank.total_points -= distribution_amount
    
    # Create distribution record
    distribution = RewardDistribution(
        bank_id=bank.id,
        distribution_type=distribution_type,
        total_amount=distribution_amount,
        winners_data=winners_data
    )
    db.add(distribution)
    
    # Create transactions for each winner
    for winner in winners_data:
        transaction = BankTransaction(
            user_id=winner["user_id"],
            task_id=None,
            amount=winner["reward"],
            transaction_type="withdrawal",
            description=f"{distribution_type.capitalize()} reward distribution"
        )
        db.add(transaction)
    
    db.commit()
    
    return distribution