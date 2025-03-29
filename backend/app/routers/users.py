from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db
from ..utils import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.get("/me")
def get_current_user_data(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "created_at": current_user.created_at,
    }
    
@router.get("/")
def get_all_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    users = db.query(models.User).filter(models.User.id != current_user.id).all()
    
    # List comprehension is being used here
    
    return [
        {
            "id": user.id,
            "username": user.username,
            "created_at": user.created_at
        }
        for user in users
    ]