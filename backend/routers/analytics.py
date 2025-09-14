from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract
from typing import List, Dict, Any
from datetime import datetime, timedelta

from database import get_db
from models import User
from routers.auth import get_current_user

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get dashboard analytics for current user"""
    return {
        "total_earnings": current_user.total_earnings,
        "referral_earnings": current_user.referral_earnings,
        "task_earnings": current_user.task_earnings,
        "total_referrals": current_user.level1_referrals + current_user.level2_referrals + current_user.level3_referrals,
        "level1_referrals": current_user.level1_referrals,
        "level2_referrals": current_user.level2_referrals,
        "level3_referrals": current_user.level3_referrals
    }
