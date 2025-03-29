from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import auth, users
from .models import User
from .utils import get_password_hash
from .database import SessionLocal


app = FastAPI()

# Use the following command to start the app
# python -m uvicorn app.main:app --reload --loop asyncio --workers 1
"""
If you are getting a stale terminal make sure to kill any existing python process

"""

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create DB tables
Base.metadata.create_all(bind=engine)

# Register endpoints
app.include_router(auth.router)
app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "Backend is up"}
