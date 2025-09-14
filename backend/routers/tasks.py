from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User
from routers.auth import get_current_user

router = APIRouter()

@router.get("/")
async def get_tasks(current_user: User = Depends(get_current_user)):
    """Get available tasks"""
    # Return empty list for now since Task model doesn't exist
    return []

@router.get("/my-tasks")
async def get_my_tasks(current_user: User = Depends(get_current_user)):
    """Get user's tasks"""
    # Return empty list for now since UserTask model doesn't exist
    return []
