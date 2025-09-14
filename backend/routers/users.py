from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User
from schemas import UserResponse
from routers.auth import get_current_user

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
    return current_user

@router.get("/referral-stats")
async def get_referral_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's referral statistics"""
    return {
        "total_referrals": current_user.level1_referrals + current_user.level2_referrals + current_user.level3_referrals,
        "level1_referrals": current_user.level1_referrals,
        "level2_referrals": current_user.level2_referrals,
        "level3_referrals": current_user.level3_referrals,
        "referral_earnings": current_user.referral_earnings,
        "total_earnings": current_user.total_earnings
    }

@router.get("/referral-link")
async def get_referral_link(current_user: User = Depends(get_current_user)):
    """Get user's referral link"""
    from config import settings
    base_url = settings.ALLOWED_ORIGINS[0] if settings.ALLOWED_ORIGINS else "http://localhost:3000"
    return {
        "referral_code": current_user.referral_code,
        "referral_link": f"{base_url}/airdrop?ref={current_user.referral_code}"
    }
