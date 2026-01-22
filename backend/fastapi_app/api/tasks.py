from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional

# Local imports
from fastapi_app.models.task import TaskTemplate, UserTask, TaskBidHistory
from fastapi_app.models.user import User
from fastapi_app.models.bank import Bank, BankTransaction
from fastapi_app.schemas.task import TaskTemplateCreate, TaskTemplateResponse, UserTaskCreate, UserTaskResponse, TaskBidHistoryResponse
from fastapi_app.database.database import get_db
from fastapi_app.utils.security import get_current_user

router = APIRouter()

@router.get("/templates", response_model=List[TaskTemplateResponse])
def get_task_templates(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user)
):
    """
    Get list of task templates
    """
    query = db.query(TaskTemplate)
    
    if category:
        query = query.filter(TaskTemplate.category == category)
    
    if search:
        query = query.filter(TaskTemplate.title.ilike(f"%{search}%"))
    
    return query.all()

@router.post("/templates", response_model=TaskTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_task_template(
    template: TaskTemplateCreate,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user)
):
    """
    Create a new task template
    """
    db_template = TaskTemplate(**template.dict())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@router.get("/my-tasks", response_model=List[UserTaskResponse])
def get_user_tasks(
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user)
):
    """
    Get current user's tasks
    """
    user = db.query(User).filter(User.username == token_data.username).first()
    
    query = db.query(UserTask).filter(UserTask.user_id == user.id)
    
    if status == "active":
        query = query.filter(UserTask.is_completed == False)
    elif status == "completed":
        query = query.filter(UserTask.is_completed == True)
    
    if category:
        query = query.filter(UserTask.category == category)
    
    return query.all()

@router.post("/my-tasks", response_model=UserTaskResponse, status_code=status.HTTP_201_CREATED)
def create_user_task(
    task: UserTaskCreate,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user)
):
    """
    Create a new task for current user
    """
    user = db.query(User).filter(User.username == token_data.username).first()
    
    # Check if user has available task slots
    active_tasks = db.query(UserTask).filter(
        UserTask.user_id == user.id, 
        UserTask.is_completed == False
    ).count()
    
    if active_tasks >= user.task_slots:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No available task slots. Consider upgrading."
        )
    
    # Check if bid amount is valid
    if task.template_id:
        template = db.query(TaskTemplate).filter(TaskTemplate.id == task.template_id).first()
        if template and task.bid_amount > template.max_allowed_bid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Bid amount too high. Maximum allowed: {template.max_allowed_bid} points."
            )
    
    # Create user task
    db_task = UserTask(
        user_id=user.id,
        **task.dict()
    )
    db.add(db_task)
    
    # Record bid in history if template exists
    if task.template_id:
        bid_history = TaskBidHistory(
            task_template_id=task.template_id,
            user_id=user.id,
            bid_amount=task.bid_amount
        )
        db.add(bid_history)
        
        # Recalculate average bid and max allowed bid
        template.usage_count += 1
        
        # Get all bids for this template
        bids = db.query(TaskBidHistory).filter(
            TaskBidHistory.task_template_id == task.template_id
        ).all()
        
        if bids:
            total_bid = sum(b.bid_amount for b in bids)
            template.average_bid = total_bid / len(bids)
            template.max_allowed_bid = template.average_bid * 1.2  # 20% above average
    
    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/my-tasks/{task_id}/complete", response_model=UserTaskResponse)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user)
):
    """
    Mark task as completed and calculate rewards
    """
    user = db.query(User).filter(User.username == token_data.username).first()
    task = db.query(UserTask).filter(UserTask.id == task_id, UserTask.user_id == user.id).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.is_completed:
        raise HTTPException(status_code=400, detail="Task already completed")
    
    # Mark task as completed
    task.is_completed = True
    task.completion_date = datetime.utcnow()
    
    # Update streak
    if task.streak_count == 0 or (datetime.utcnow() - task.updated_at).days == 1:
        task.streak_count += 1
    else:
        task.streak_count = 1
    
    # Update user's streak
    if user.streak_count == 0 or (datetime.utcnow() - user.updated_at).days == 1:
        user.streak_count += 1
        if user.streak_count > user.max_streak:
            user.max_streak = user.streak_count
    else:
        user.streak_count = 1
    
    # Calculate reward: 10% of bid amount
    reward = task.bid_amount * 0.1
    user.points += task.bid_amount + reward  # Return bid + 10% reward
    user.total_earned_points += reward
    
    db.commit()
    db.refresh(task)
    return task

@router.put("/my-tasks/{task_id}/fail", response_model=UserTaskResponse)
def fail_task(
    task_id: int,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user)
):
    """
    Mark task as failed and transfer bid to bank
    """
    user = db.query(User).filter(User.username == token_data.username).first()
    task = db.query(UserTask).filter(UserTask.id == task_id, UserTask.user_id == user.id).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.is_completed:
        raise HTTPException(status_code=400, detail="Cannot fail completed task")
    
    # Mark task as completed (failed)
    task.is_completed = True
    task.completion_date = datetime.utcnow()
    
    # Reset user's streak
    user.streak_count = 0
    
    # Deduct bid amount and transfer to bank
    user.points -= task.bid_amount
    user.negative_points += task.bid_amount
    
    # Find or create bank
    bank = db.query(Bank).first()
    if not bank:
        bank = Bank(total_points=0)
        db.add(bank)
    
    bank.total_points += task.bid_amount
    
    # Create bank transaction record
    transaction = BankTransaction(
        user_id=user.id,
        task_id=task.id,
        amount=task.bid_amount,
        transaction_type="deposit",
        description=f"Failed task: {task.title}"
    )
    db.add(transaction)
    
    db.commit()
    db.refresh(task)
    return task