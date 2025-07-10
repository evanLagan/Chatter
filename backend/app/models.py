from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
import datetime
from pydantic import BaseModel

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    
class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    

class GroupChat(Base):
    __tablename__ = "group_chats"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=False, nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    creator = relationship("User", backref="created_groups")
    members = relationship("GroupMembership", back_populates="group")
    
    
class GroupMembership(Base):
    __tablename__ = "group_membership"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("group_chats.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    
    group = relationship("GroupChat", back_populates="members")
    user = relationship("User", backref="group_memberships")
    
class GroupMessage(Base):
    __tablename__ = "group_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("group_chats.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    group = relationship("GroupChat", backref="messages")
    sender = relationship("User", backref="group_messages_sent")
    
    
    
    
    