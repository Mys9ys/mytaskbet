from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional

# Local imports
from fastapi_app.models.ranking import Ranking, UserTaskRanking
from fastapi_app.models.user import User
from fastapi_app.models.task import TaskTemplate, UserTask
from fastapi_app.schemas.ranking import RankingResponse, UserTaskRankingResponse, LeaderboardResponse, UserRankingsResponse
from fastapi_app.database.database import get_db
from fastapi_app.utils.security import get_current_user

router = APIRouter()

@router.get("/leaderboard/{ranking_type}", response_model=LeaderboardResponse)
def get_leaderboard(
    ranking_type: str,
    task_id: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get leaderboard for a specific ranking type
    """
    # Validate ranking type
    valid_types = ["points", "negative_points", "streak", "task_specific"]
    if ranking_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid ranking type. Must be one of: {valid_types}"
        )
    
    # Base query
    query = db.query(Ranking).filter(Ranking.ranking_type == ranking_type)
    
    # Filter by task for task-specific rankings
    if ranking_type == "task_specific" and task_id:
        query = query.filter(Ranking.task_id == task_id)
    elif ranking_type == "task_specific" and not task_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="task_id is required for task_specific ranking"
        )
    
    # Order by rank position and limit results
    rankings = query.order_by(Ranking.rank_position).limit(limit).all()
    
    # Get user data for each ranking
    entries = []
    for ranking in rankings:
        user = db.query(User).filter(User.id == ranking.user_id).first()
        if user:
            entries.append({
                "user_id": user.id,
                "username": user.username,
                "value": ranking.value,
                "rank_position": ranking.rank_position
            })
    
    return {
        "ranking_type": ranking_type,
        "entries": entries,
        "total_participants": len(entries),
        "updated_at": datetime.utcnow()
    }

@router.get("/user/{user_id}/rankings", response_model=UserRankingsResponse)
def get_user_rankings(
    user_id: int,
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user)
):
    """
    Get all rankings for a specific user
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's main rankings
    rankings = db.query(Ranking).filter(Ranking.user_id == user_id).all()
    
    # Extract key rankings
    points_ranking = next((r for r in rankings if r.ranking_type == "points"), None)
    streak_ranking = next((r for r in rankings if r.ranking_type == "streak"), None)
    negative_ranking = next((r for r in rankings if r.ranking_type == "negative_points"), None)
    
    # Get task-specific rankings
    task_rankings = db.query(UserTaskRanking).filter(UserTaskRanking.user_id == user_id).all()
    
    task_rankings_data = []
    for task_ranking in task_rankings:
        task_template = db.query(TaskTemplate).filter(TaskTemplate.id == task_ranking.task_template_id).first()
        task_name = task_template.title if task_template else f"Task {task_ranking.task_template_id}"
        
        task_rankings_data.append({
            "task_id": task_ranking.task_template_id,
            "task_name": task_name,
            "total_earned": task_ranking.total_earned,
            "completion_count": task_ranking.completion_count,
            "success_rate": task_ranking.success_rate
        })
    
    return {
        "overall_rank": points_ranking.rank_position if points_ranking else None,
        "points": user.points,
        "negative_points": user.negative_points,
        "streak_rank": streak_ranking.rank_position if streak_ranking else None,
        "streak_count": user.streak_count,
        "task_rankings": task_rankings_data
    }

@router.get("/update", response_model=dict)
def update_rankings(
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user)
):
    """
    Update all rankings based on current user data
    """
    # Get all users
    users = db.query(User).all()
    
    if not users:
        return {"message": "No users to rank"}
    
    # Update points ranking
    users_sorted_by_points = sorted(users, key=lambda u: u.points, reverse=True)
    for rank_position, user in enumerate(users_sorted_by_points, 1):
        ranking = db.query(Ranking).filter(
            Ranking.user_id == user.id, 
            Ranking.ranking_type == "points"
        ).first()
        
        if ranking:
            ranking.value = user.points
            ranking.rank_position = rank_position
        else:
            ranking = Ranking(
                user_id=user.id,
                ranking_type="points",
                value=user.points,
                rank_position=rank_position
            )
            db.add(ranking)
    
    # Update negative points ranking
    users_sorted_by_negative = sorted(users, key=lambda u: u.negative_points, reverse=True)
    for rank_position, user in enumerate(users_sorted_by_negative, 1):
        ranking = db.query(Ranking).filter(
            Ranking.user_id == user.id, 
            Ranking.ranking_type == "negative_points"
        ).first()
        
        if ranking:
            ranking.value = user.negative_points
            ranking.rank_position = rank_position
        else:
            ranking = Ranking(
                user_id=user.id,
                ranking_type="negative_points",
                value=user.negative_points,
                rank_position=rank_position
            )
            db.add(ranking)
    
    # Update streak ranking
    users_sorted_by_streak = sorted(users, key=lambda u: u.streak_count, reverse=True)
    for rank_position, user in enumerate(users_sorted_by_streak, 1):
        ranking = db.query(Ranking).filter(
            Ranking.user_id == user.id, 
            Ranking.ranking_type == "streak"
        ).first()
        
        if ranking:
            ranking.value = user.streak_count
            ranking.rank_position = rank_position
        else:
            ranking = Ranking(
                user_id=user.id,
                ranking_type="streak",
                value=user.streak_count,
                rank_position=rank_position
            )
            db.add(ranking)
    
    # Update user task rankings
    # Get all task templates
    task_templates = db.query(TaskTemplate).all()
    
    for template in task_templates:
        # Get all completed tasks for this template
        user_tasks = db.query(UserTask).filter(
            UserTask.template_id == template.id,
            UserTask.is_completed == True
        ).all()
        
        # Group by user and calculate statistics
        user_stats = {}
        for task in user_tasks:
            if task.user_id not in user_stats:
                user_stats[task.user_id] = {
                    "total_earned": 0,
                    "completion_count": 0
                }
            
            # Calculate earned points: 10% of bid amount
            earned = task.bid_amount * 0.1
            user_stats[task.user_id]["total_earned"] += earned
            user_stats[task.user_id]["completion_count"] += 1
        
        # Update or create UserTaskRanking for each user
        for user_id, stats in user_stats.items():
            success_rate = (stats["completion_count"] / template.usage_count) * 100 if template.usage_count > 0 else 0
            
            task_ranking = db.query(UserTaskRanking).filter(
                UserTaskRanking.user_id == user_id,
                UserTaskRanking.task_template_id == template.id
            ).first()
            
            if task_ranking:
                task_ranking.total_earned = stats["total_earned"]
                task_ranking.completion_count = stats["completion_count"]
                task_ranking.success_rate = success_rate
            else:
                task_ranking = UserTaskRanking(
                    user_id=user_id,
                    task_template_id=template.id,
                    total_earned=stats["total_earned"],
                    completion_count=stats["completion_count"],
                    success_rate=success_rate
                )
                db.add(task_ranking)
    
    db.commit()
    
    return {"message": "Rankings updated successfully", "timestamp": datetime.utcnow()}

@router.get("/my", response_model=UserRankingsResponse)
def get_my_rankings(
    db: Session = Depends(get_db),
    token_data: dict = Depends(get_current_user)
):
    """
    Get current user's rankings
    """
    user = db.query(User).filter(User.username == token_data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return get_user_rankings(user.id, db, token_data)