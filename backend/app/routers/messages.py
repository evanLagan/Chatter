from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db
from ..utils import get_current_user
from datetime import datetime
from ..schemas import MessageCreate

router = APIRouter(
    prefix="/messages",
    tags=["messages"]
)

@router.post("/")
def send_message(
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if message.receiver_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot message yourself.")
    
    new_message = models.Message(
        sender_id=current_user.id,
        receiver_id=message.receiver_id,
        content=message.content,
        timestamp=datetime.utcnow()
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message


@router.get("/{user_id}")
def get_messages_with_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    messages = db.query(models.Message).filter(
        ((models.Message.sender_id == current_user.id) & (models.Message.receiver_id == user_id)) |
        ((models.Message.sender_id == user_id) & (models.Message.receiver_id == current_user.id))
    ).order_by(models.Message.timestamp).all()
    return messages