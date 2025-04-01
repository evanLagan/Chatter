from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str
    
class UserOut(BaseModel):
    id: int
    username: str
    
    class Config:
        orm_mode = True
        
class Token(BaseModel):
    access_token: str
    token_type: str
    
class MessageCreate(BaseModel):
    receiver_id: int
    content: str
    

    