import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi_app.database.database import SessionLocal, engine, Base
from fastapi_app.models.user import User
from fastapi_app.utils.security import get_password_hash

db = SessionLocal()
try:
    hashed = get_password_hash("test123")
    print("Hash OK:", hashed)
    u = User(username="testuser2", email="test2@example.com", hashed_password=hashed)
    db.add(u)
    db.commit()
    db.refresh(u)
    print("User created:", u.id, u.username, u.points)
except Exception as e:
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
