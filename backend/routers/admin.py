from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta

from database import get_db
from models import User, SystemSettings, AdminNotification
from schemas import UserResponse
from routers.auth import get_current_user
from config import settings
from services.notification_service import NotificationService

router = APIRouter()

def is_admin(current_user: User = Depends(get_current_user)):
    """Check if current user is admin - for development, allow any verified user"""
    # For development purposes, allow any verified user to access admin endpoints
    # In production, you should check current_user.is_admin
    if not current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required for admin access"
        )
    return current_user

@router.get("/check-admin")
async def check_admin_status(current_user: User = Depends(get_current_user)):
    """Check if current user has admin privileges"""
    # For development purposes, any verified user is considered admin
    # In production, you should return current_user.is_admin
    return {"is_admin": current_user.email_verified, "user_id": current_user.id}

@router.get("/stats")
async def get_admin_stats(admin_user: User = Depends(is_admin), db: Session = Depends(get_db)):
    """Get platform statistics for admin dashboard"""
    
    # User statistics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    # Earnings statistics
    total_earnings = db.query(func.sum(User.total_earnings)).scalar() or 0
    total_referral_earnings = db.query(func.sum(User.referral_earnings)).scalar() or 0
    total_task_earnings = db.query(func.sum(User.task_earnings)).scalar() or 0
    
    # Referral statistics
    total_referrals = db.query(func.sum(User.level1_referrals + User.level2_referrals + User.level3_referrals)).scalar() or 0
    
    # Recent users
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(5).all()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_earnings": total_earnings,
        "total_referral_earnings": total_referral_earnings,
        "total_task_earnings": total_task_earnings,
        "total_referrals": total_referrals,
        "recent_users": [
            {
                "id": user.id,
                "email": user.email,
                "created_at": user.created_at,
                "total_earnings": user.total_earnings
            }
            for user in recent_users
        ]
    }

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(admin_user: User = Depends(is_admin), db: Session = Depends(get_db), skip: int = 0, limit: int = 100, search: Optional[str] = None, is_active: Optional[bool] = None):
    """Get all users with optional filtering"""
    query = db.query(User)
    if search:
        query = query.filter(User.email.contains(search))
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/maintenance")
async def get_maintenance_mode(admin_user: User = Depends(is_admin), db: Session = Depends(get_db)):
    """Get current maintenance mode status"""
    setting = db.query(SystemSettings).filter(SystemSettings.key == "maintenance_mode").first()
    if setting:
        return {"enabled": setting.value}
    return {"enabled": False}

@router.post("/maintenance")
async def toggle_maintenance_mode(request: dict, admin_user: User = Depends(is_admin), db: Session = Depends(get_db)):
    """Toggle maintenance mode"""
    enabled = request.get("enabled", False)
    
    # Get or create maintenance mode setting
    setting = db.query(SystemSettings).filter(SystemSettings.key == "maintenance_mode").first()
    
    if setting:
        setting.value = enabled
        setting.updated_at = func.now()
    else:
        setting = SystemSettings(
            key="maintenance_mode",
            value=enabled,
            description="System maintenance mode toggle"
        )
        db.add(setting)
    
    db.commit()
    db.refresh(setting)
    
    return {
        "message": f"Maintenance mode {'enabled' if enabled else 'disabled'}",
        "enabled": enabled
    }

@router.get("/maintenance/status")
async def get_maintenance_status(db: Session = Depends(get_db)):
    """Get maintenance mode status (public endpoint)"""
    setting = db.query(SystemSettings).filter(SystemSettings.key == "maintenance_mode").first()
    if setting:
        return {"enabled": setting.value}
    return {"enabled": False}

@router.post("/kyc-setting")
async def update_kyc_setting(request: dict, admin_user: User = Depends(is_admin), db: Session = Depends(get_db)):
    """Update KYC requirement setting"""
    kyc_required = request.get("kycRequired", False)
    
    # Get or create KYC setting
    setting = db.query(SystemSettings).filter(SystemSettings.key == "kyc_required").first()
    
    if setting:
        setting.value = kyc_required
        setting.updated_at = func.now()
    else:
        setting = SystemSettings(
            key="kyc_required",
            value=kyc_required,
            description="KYC verification requirement toggle"
        )
        db.add(setting)
    
    db.commit()
    db.refresh(setting)
    
    return {
        "message": f"KYC requirement {'enabled' if kyc_required else 'disabled'}",
        "kycRequired": kyc_required
    }

@router.post("/clear-kyc-cache")
async def clear_kyc_cache(admin_user: User = Depends(is_admin)):
    """Clear all KYC-related caches (admin only)"""
    try:
        # Import the KYC cache clearing function
        from routers.kyc import clear_kyc_cache
        
        # Clear the cache
        clear_kyc_cache()
        
        return {
            "success": True,
            "message": "KYC cache cleared successfully",
            "cleared_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear KYC cache: {str(e)}"
        )

@router.get("/kyc-cache-status")
async def get_kyc_cache_status(admin_user: User = Depends(is_admin)):
    """Get KYC cache status and statistics (admin only)"""
    try:
        # Import KYC cache variables
        from routers.kyc import active_sessions, user_attempts, face_attempts, banned_users, banned_faces, face_hash_storage, duplicate_violations
        
        return {
            "success": True,
            "cache_stats": {
                "active_sessions": len(active_sessions),
                "user_attempts": len(user_attempts),
                "face_attempts": len(face_attempts),
                "banned_users": len(banned_users),
                "banned_faces": len(banned_faces),
                "face_hash_storage": len(face_hash_storage),
                "duplicate_violations": len(duplicate_violations)
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get KYC cache status: {str(e)}"
        )

@router.post("/reset-user-kyc/{user_id}")
async def reset_user_kyc(user_id: int, admin_user: User = Depends(is_admin), db: Session = Depends(get_db)):
    """Reset a user's KYC status (admin only)"""
    try:
        # Find the user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Reset KYC status
        user.kyc_completed = False
        
        # Clear user's KYC-related cache data
        from routers.kyc import user_attempts, banned_users, face_hash_storage
        
        # Remove from caches
        if user_id in user_attempts:
            del user_attempts[user_id]
        if user_id in banned_users:
            banned_users.discard(user_id)
        
        # Remove face hash if exists
        face_hashes_to_remove = [fh for fh, uid in face_hash_storage.items() if uid == user_id]
        for fh in face_hashes_to_remove:
            del face_hash_storage[fh]
        
        db.commit()
        
        return {
            "success": True,
            "message": f"KYC status reset for user {user.email} (ID: {user_id})",
            "user_id": user_id,
            "user_email": user.email,
            "kyc_completed": user.kyc_completed,
            "reset_at": datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset user KYC: {str(e)}"
        )

@router.get("/user-kyc-status/{user_id}")
async def get_user_kyc_status(user_id: int, admin_user: User = Depends(is_admin), db: Session = Depends(get_db)):
    """Get a user's KYC status and related cache data (admin only)"""
    try:
        # Find the user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get cache data
        from routers.kyc import user_attempts, banned_users, face_hash_storage, active_sessions
        
        # Find user's face hash
        user_face_hash = None
        for fh, uid in face_hash_storage.items():
            if uid == user_id:
                user_face_hash = fh
                break
        
        # Find active sessions for this user
        user_sessions = [sid for sid, data in active_sessions.items() if data.get('user_id') == user_id]
        
        return {
            "success": True,
            "user": {
                "id": user.id,
                "email": user.email,
                "kyc_completed": user.kyc_completed,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            },
            "cache_data": {
                "has_attempts": user_id in user_attempts,
                "attempt_count": len(user_attempts.get(user_id, [])),
                "is_banned": user_id in banned_users,
                "face_hash": user_face_hash,
                "active_sessions": user_sessions
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user KYC status: {str(e)}"
        )

@router.get("/face-hash-storage")
async def get_face_hash_storage(admin_user: User = Depends(is_admin)):
    """Get all face hash storage data (admin only)"""
    try:
        from routers.kyc import face_hash_storage
        
        # Convert face hash storage to a more readable format
        face_hash_data = []
        for face_hash, user_id in face_hash_storage.items():
            face_hash_data.append({
                "face_hash": face_hash,
                "user_id": user_id
            })
        
        return {
            "success": True,
            "face_hash_count": len(face_hash_storage),
            "face_hashes": face_hash_data,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get face hash storage: {str(e)}"
        )

@router.post("/users/{user_id}/ban")
async def ban_user(
    user_id: int,
    current_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """Ban a user (admin only)"""
    try:
        # Get the user to ban
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent admin users from being banned through admin panel
        if user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin users cannot be banned through the admin panel. Use the user panel for admin bans."
            )
        
        # Check if user is already banned
        if not user.is_active:
            return {
                "success": True,
                "message": f"User {user.email} is already banned",
                "user_id": user_id,
                "is_active": user.is_active
            }
        
        # Ban the user
        user.is_active = False
        user.kyc_completed = False  # Reset KYC status when banned
        
        # Create admin notification for manual ban
        try:
            NotificationService.create_user_ban_notification(
                db=db,
                user_id=user.id,
                user_email=user.email,
                ban_reason="Manual ban by admin",
                banned_by=admin_user.email
            )
        except Exception as notification_error:
            # Don't fail the ban process if notification fails
            pass
        
        db.commit()
        
        return {
            "success": True,
            "message": f"User {user.email} has been banned",
            "user_id": user_id,
            "is_active": user.is_active
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ban user: {str(e)}"
        )

@router.post("/users/{user_id}/unban")
async def unban_user(
    user_id: int,
    current_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """Unban a user (admin only)"""
    try:
        # Get the user to unban
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if user is already active
        if user.is_active:
            return {
                "success": True,
                "message": f"User {user.email} is already active",
                "user_id": user_id,
                "is_active": user.is_active
            }
        
        # Unban the user
        user.is_active = True
        db.commit()
        
        return {
            "success": True,
            "message": f"User {user.email} has been unbanned",
            "user_id": user_id,
            "is_active": user.is_active
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unban user: {str(e)}"
        )

@router.get("/notifications")
async def get_notifications(
    unread_only: bool = False,
    limit: int = 50,
    admin_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """Get admin notifications"""
    try:
        if unread_only:
            notifications = NotificationService.get_unread_notifications(db, limit)
        else:
            notifications = NotificationService.get_all_notifications(db, limit)
        
        return {
            "notifications": [
                {
                    "id": n.id,
                    "type": n.type,
                    "title": n.title,
                    "message": n.message,
                    "user_id": n.user_id,
                    "user_email": n.user_email,
                    "is_read": n.is_read,
                    "created_at": n.created_at.isoformat() if n.created_at else None,
                    "metadata": n.notification_data
                }
                for n in notifications
            ],
            "total": len(notifications)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notifications: {str(e)}"
        )

@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    admin_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    try:
        success = NotificationService.mark_as_read(db, notification_id)
        if success:
            return {"message": "Notification marked as read"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark notification as read: {str(e)}"
        )

@router.post("/notifications/read-all")
async def mark_all_notifications_read(
    admin_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read"""
    try:
        updated_count = NotificationService.mark_all_as_read(db)
        return {
            "message": f"Marked {updated_count} notifications as read",
            "updated_count": updated_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark all notifications as read: {str(e)}"
        )

@router.post("/settings")
async def update_system_settings(
    request: dict,
    admin_user: User = Depends(is_admin),
    db: Session = Depends(get_db)
):
    """Update system settings (admin only)"""
    try:
        # Update or create settings based on request
        settings_to_update = [
            "registration_enabled",
            "base_rewards_airdrop_tokens",
            "base_rewards_base_mining_speed",
            "base_rewards_base_mining_points",
            "referral_rewards_level1_speed_bonus",
            "referral_rewards_level1_points_bonus",
            "referral_rewards_level2_speed_bonus",
            "referral_rewards_level2_points_bonus",
            "referral_rewards_level3_speed_bonus",
            "referral_rewards_level3_points_bonus",
            "task_rewards_social",
            "task_rewards_verification",
            "task_rewards_engagement",
            "security_kyc_required",
            "security_max_referrals_per_day",
            "security_min_wallet_balance"
        ]
        
        updated_settings = {}
        
        for key in settings_to_update:
            if key in request:
                setting = db.query(SystemSettings).filter(SystemSettings.key == key).first()
                if setting:
                    setting.value = request[key]
                    setting.updated_at = func.now()
                else:
                    setting = SystemSettings(
                        key=key,
                        value=request[key],
                        description=f"System setting: {key}"
                    )
                    db.add(setting)
                updated_settings[key] = request[key]
        
        db.commit()
        
        return {
            "success": True,
            "message": "Settings updated successfully",
            "updated_settings": updated_settings
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update settings: {str(e)}"
        )