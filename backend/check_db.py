"""
Script for checking if database is functioning as expected.
- Retrieving all users
"""

from app.database import SessionLocal
from app.models import User

# Create a new DB session
db = SessionLocal()

# Query all users
users = db.query(User).all()

print("\n=== Registered Users ===")
if not users:
    print("No users found in the database")
else:
    for user in users:
        print(f"ID: {user.id}, Username: {user.username}, Created At: {user.created_at}")
        
db.close()
        