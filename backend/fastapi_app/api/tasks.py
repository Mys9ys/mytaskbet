from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from fastapi_app.models.task import TaskTemplate, UserTask
from fastapi_app.models.user import User
from fastapi_app.schemas.task import (
    TaskTemplateCreate,
    TaskTemplateResponse,
    UserTaskCreate,
    UserTaskResponse,
)
from fastapi_app.database.database import get_db
from fastapi_app.utils.security import get_current_user
from fastapi_app.utils.economy import (
    stake_for_difficulty,
    bonus_for_stake,
    achievement_points_for_difficulty,
)

router = APIRouter()


def _get_user(db: Session, username: str) -> User:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/templates", response_model=List[TaskTemplateResponse])
def get_task_templates(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user),
):
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
    token_data: dict = Depends(get_current_user),
):
    db_template = TaskTemplate(**template.model_dump())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


@router.get("/my-tasks", response_model=List[UserTaskResponse])
def get_user_tasks(
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user),
):
    user = _get_user(db, token_data.username)
    query = db.query(UserTask).filter(UserTask.user_id == user.id)
    if status == "active":
        query = query.filter(UserTask.is_completed == False)
    elif status == "completed":
        query = query.filter(UserTask.is_completed == True)
    if category:
        query = query.filter(UserTask.category == category)
    return query.order_by(UserTask.created_at.desc()).all()


@router.get("/my-tasks/{task_id}", response_model=UserTaskResponse)
def get_user_task(
    task_id: int,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user),
):
    user = _get_user(db, token_data.username)
    task = db.query(UserTask).filter(UserTask.id == task_id, UserTask.user_id == user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/my-tasks", response_model=UserTaskResponse, status_code=status.HTTP_201_CREATED)
def create_user_task(
    task: UserTaskCreate,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user),
):
    user = _get_user(db, token_data.username)
    active_tasks = (
        db.query(UserTask)
        .filter(UserTask.user_id == user.id, UserTask.is_completed == False)
        .count()
    )
    if active_tasks >= user.task_slots:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No available task slots.",
        )

    stake = stake_for_difficulty(task.difficulty)
    if user.points < stake:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Need {stake}, have {user.points}.",
        )

    user.points -= stake

    if task.template_id:
        template = db.query(TaskTemplate).filter(TaskTemplate.id == task.template_id).first()
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        template.usage_count += 1

    db_task = UserTask(
        user_id=user.id,
        title=task.title,
        description=task.description,
        category=task.category,
        template_id=task.template_id,
        difficulty=task.difficulty,
        bid_amount=stake,
        is_completed=False,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.put("/my-tasks/{task_id}/complete", response_model=UserTaskResponse)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user),
):
    user = _get_user(db, token_data.username)
    task = db.query(UserTask).filter(UserTask.id == task_id, UserTask.user_id == user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.is_completed:
        raise HTTPException(status_code=400, detail="Task already closed")

    bonus = bonus_for_stake(task.difficulty, task.bid_amount)
    ap = achievement_points_for_difficulty(task.difficulty)

    task.is_completed = True
    task.outcome = "success"
    task.completion_date = datetime.utcnow()
    task.streak_count += 1

    user.points += task.bid_amount + bonus
    user.total_earned_points += bonus
    user.achievement_points += ap
    user.streak_count += 1
    if user.streak_count > user.max_streak:
        user.max_streak = user.streak_count

    if task.template_id:
        template = db.query(TaskTemplate).filter(TaskTemplate.id == task.template_id).first()
        if template:
            template.fund_balance += 1
            template.completion_count += 1

    db.commit()
    db.refresh(task)
    return task


@router.put("/my-tasks/{task_id}/fail", response_model=UserTaskResponse)
def fail_task(
    task_id: int,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user),
):
    user = _get_user(db, token_data.username)
    task = db.query(UserTask).filter(UserTask.id == task_id, UserTask.user_id == user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.is_completed:
        raise HTTPException(status_code=400, detail="Task already closed")

    task.is_completed = True
    task.outcome = "failed"
    task.completion_date = datetime.utcnow()
    user.negative_points += task.bid_amount
    user.streak_count = 0

    db.commit()
    db.refresh(task)
    return task
