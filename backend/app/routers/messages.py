from fastapi import APIRouter, Depends, HTTPException
from fastapi import WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db
from ..utils import get_current_user
from datetime import datetime
from ..schemas import MessageCreate
from ..websockets import ConnectionManager
from ..utils import decode_token
from jose import JWTError

router = APIRouter(
    prefix="/messages",
    tags=["messages"]
)

manager = ConnectionManager()

@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...), db: Session = Depends(get_db)):
    try:
        payload = decode_token(token)
        print("Token payload:", payload)
        
        username = payload.get("sub")
        db_user = db.query(models.User).filter(models.User.username == username).first()
        
        if not db_user:
            raise Exception("User not found")
        
        user_id = db_user.id 
        
    except Exception as e:
        print("Websocket token error:", e)    
        await websocket.close(code=1008)
        return
    
    await manager.connect(user_id, websocket)
    
    try:
        while True:
            data = await websocket.receive_json()
            receiver_id = data["receiver_id"]
            content = data["content"]
            
            new_msg = models.Message(
                sender_id=user_id,
                receiver_id=receiver_id,
                content=content,
                timestamp=datetime.utcnow()
            )
            db.add(new_msg)
            db.commit()
            db.refresh(new_msg)
            
            msg_data = {
                "sender_id": user_id,
                "receiver_id": receiver_id,
                "content": content,
                "timestamp": new_msg.timestamp.isoformat()
            }
            
            # Send to both sender and receiver (if online)
            await manager.send_personal_message(msg_data, receiver_id)
            await manager.send_personal_message(msg_data, user_id)
            
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
        

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


# Group Chat Messages

group_connections = {}

@router.websocket("/ws/group/{group_id}")
async def group_chat_websocket(websocket: WebSocket, group_id: int, token: str = Query(...), db: Session = Depends(get_db)):
    try:
        payload = decode_token(token)
        username = payload.get("sub")
        user = db.query(models.User).filter_by(username=username).first()
        if not user:
            await websocket.close(code=1008)
            return
        user_id = user.id
        print("Token validated:", user_id)
    except Exception as e:
        print("WebSocket token error:", e)
        await websocket.close(code=1008)
        return

    # Accept connection only after validation
    await websocket.accept()

    if group_id not in group_connections:
        group_connections[group_id] = []
    group_connections[group_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            content = data.get("content")

            new_msg = models.GroupMessage(
                sender_id=user_id,
                group_id=group_id,
                content=content,
                timestamp=datetime.utcnow()
            )
            db.add(new_msg)
            db.commit()
            db.refresh(new_msg)

            # Prepare data to send
            msg_data = {
                "sender_id": user_id,
                "content": content,
                "timestamp": new_msg.timestamp.isoformat()
            }

            for conn in group_connections[group_id]:
                await conn.send_json(msg_data)

    except WebSocketDisconnect:
        group_connections[group_id].remove(websocket)


   
@router.get("/group/{group_id}")
def get_group_messages(group_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Make sure that the user belongs to the group
    is_member = db.query(models.GroupMembership).filter_by(group_id=group_id, user_id=current_user.id).first()
    if not is_member:
        raise HTTPException(status_code=403, detail="You are not a member of this group")
    
    messages = db.query(models.GroupMessage).filter_by(group_id=group_id).order_by(models.GroupMessage.timestamp).all()
    
    # Include sender username in each message
    results = []
    for msg in messages:
        sender = db.query(models.User).filter_by(id=msg.sender_id).first()
        results.append({
            "id": msg.id,
            "group_id": msg.group_id,
            "sender_id": msg.sender_id,
            "sender_username": sender.username if sender else "Unkown",
            "content": msg.content,
            "timestamp": msg.timestamp.isoformat()
        })
    return results