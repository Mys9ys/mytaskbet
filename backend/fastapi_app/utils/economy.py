from typing import Literal

Difficulty = Literal["easy", "medium", "hard"]

STAKE_BY_DIFFICULTY: dict[str, float] = {
    "easy": 20.0,
    "medium": 50.0,
    "hard": 100.0,
}

BONUS_RATE_BY_DIFFICULTY: dict[str, float] = {
    "easy": 0.05,
    "medium": 0.10,
    "hard": 0.15,
}

ACHIEVEMENT_BY_DIFFICULTY: dict[str, int] = {
    "easy": 1,
    "medium": 3,
    "hard": 5,
}


def stake_for_difficulty(difficulty: str) -> float:
    key = difficulty if difficulty in STAKE_BY_DIFFICULTY else "easy"
    return STAKE_BY_DIFFICULTY[key]


def bonus_for_stake(difficulty: str, stake: float) -> float:
    key = difficulty if difficulty in BONUS_RATE_BY_DIFFICULTY else "easy"
    return round(stake * BONUS_RATE_BY_DIFFICULTY[key], 2)


def achievement_points_for_difficulty(difficulty: str) -> int:
    key = difficulty if difficulty in ACHIEVEMENT_BY_DIFFICULTY else "easy"
    return ACHIEVEMENT_BY_DIFFICULTY[key]
