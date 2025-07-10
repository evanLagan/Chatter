from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models
from .. database import get_db
from ..utils import get_current_user
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter(
    prefix="/groups",
    tags=["groups"]
)

# Request body schema
class GroupCreate(BaseModel):
    name: str
    member_ids: List[int] = []
    
@router.post("/")
def create_group(group: GroupCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_group = models.GroupChat(
        name=group.name,
        creator_id=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    
    # Add creator as a member
    creator_membership = models.GroupMembership(
        group_id=new_group.id,
        user_id=current_user.id
    )
    db.add(creator_membership)
    
    # Add other users
    for uid in group.member_ids:
        if uid == current_user.id:
            continue
        db.add(models.GroupMembership(group_id=new_group.id, user_id=uid))
        
    db.commit()
    return {"message": "Group created successfully", "group_id": new_group.id}

@router.get("/")
def get_my_groups(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    groups = (
        db.query(models.GroupChat)
        .join(models.GroupMembership)
        .filter(models.GroupMembership.user_id == current_user.id)
        .all()
    )
    return groups


# endpoint for getting group name, could be extended to retrieving more metadata
@router.get("/{group_id}")
def get_group_info(group_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    group = db.query(models.GroupChat).filter_by(id=group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    is_member = db.query(models.GroupMembership).filter_by(group_id=group_id, user_id=current_user.id).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="You're not a member of this group")
    
    return {
        "id": group.id,
        "name": group.name,
        "creator_id": group.creator_id,
        "created_at": group.created_at.isoformat()
    }