"""
Application settings and configuration for TaskBet
"""

# Database configuration
DATABASE_URL = "sqlite:///taskbet.db"

# Initial user points
INITIAL_USER_POINTS = 2000

# Registration settings
INITIAL_TASK_CHOICES = 10

# Points system
SUCCESS_REWARD_PERCENT = 0.10  # 10% of bid amount for successful task completion

# Task bid limits
MAX_BID_PREMIUM = 0.20  # Maximum 20% above average community bid

# API settings
API_VERSION = "v1"
DEBUG = True

# JWT settings
JWT_SECRET_KEY = "taskbet_secret_key_change_in_production"
JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours

# Task categories
TASK_CATEGORIES = [
    "habits",
    "daily_tasks",
    "goals",
    "challenges"
]
