from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

from fastapi_app.database.database import Base, engine
from fastapi_app.models import user, task, bank  # noqa: F401
from fastapi_app.models import ranking  # noqa: F401


def _sqlite_add_column_if_missing(conn, table: str, column: str, ddl: str) -> None:
    rows = conn.execute(text(f"PRAGMA table_info({table})")).fetchall()
    names = {row[1] for row in rows}
    if column not in names:
        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {ddl}"))


def bootstrap_schema(db_engine: Engine = engine) -> None:
    Base.metadata.create_all(bind=db_engine)
    if not str(db_engine.url).startswith("sqlite"):
        return
    with db_engine.begin() as conn:
        _sqlite_add_column_if_missing(conn, "users", "achievement_points", "achievement_points INTEGER DEFAULT 0")
        _sqlite_add_column_if_missing(conn, "user_tasks", "difficulty", "difficulty VARCHAR DEFAULT 'easy'")
        _sqlite_add_column_if_missing(conn, "user_tasks", "outcome", "outcome VARCHAR")
        _sqlite_add_column_if_missing(conn, "task_templates", "fund_balance", "fund_balance INTEGER DEFAULT 0")
        _sqlite_add_column_if_missing(conn, "task_templates", "completion_count", "completion_count INTEGER DEFAULT 0")
