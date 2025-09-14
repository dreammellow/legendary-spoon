"""
Admin Notification Service
Handles creating and managing admin notifications
"""

from sqlalchemy.orm import Session
from datetime import datetime, timezone
from models import AdminNotification
from typing import Optional, Dict, Any

class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        notification_type: str,
        title: str,
        message: str,
        user_id: Optional[int] = None,
        user_email: Optional[str] = None,
        notification_data: Optional[Dict[str, Any]] = None
    ) -> AdminNotification:
        """Create a new admin notification"""
        
        notification = AdminNotification(
            type=notification_type,
            title=title,
            message=message,
            user_id=user_id,
            user_email=user_email,
            notification_data=notification_data or {},
            is_read=False,
            created_at=datetime.now(timezone.utc)
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        return notification
    
    @staticmethod
    def create_kyc_ban_notification(
        db: Session,
        user1_id: int,
        user2_id: int,
        user1_email: str,
        user2_email: str,
        violation_reason: str = "Duplicate KYC verification"
    ) -> AdminNotification:
        """Create a notification for KYC ban due to duplicate verification"""
        
        title = "🚨 KYC Violation - Users Banned"
        message = f"Two users have been banned due to duplicate KYC verification:\n\n" \
                 f"• User 1: {user1_email} (ID: {user1_id})\n" \
                 f"• User 2: {user2_email} (ID: {user2_id})\n\n" \
                 f"Reason: {violation_reason}\n\n" \
                 f"Both users have been automatically banned and their KYC status reset."
        
        notification_data = {
            "user1_id": user1_id,
            "user2_id": user2_id,
            "user1_email": user1_email,
            "user2_email": user2_email,
            "violation_reason": violation_reason,
            "ban_timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        return NotificationService.create_notification(
            db=db,
            notification_type="kyc_ban",
            title=title,
            message=message,
            user_id=user1_id,  # Primary user
            user_email=user1_email,
            notification_data=notification_data
        )
    
    @staticmethod
    def create_user_ban_notification(
        db: Session,
        user_id: int,
        user_email: str,
        ban_reason: str,
        banned_by: Optional[str] = None
    ) -> AdminNotification:
        """Create a notification for manual user ban"""
        
        title = "🔒 User Banned"
        message = f"User has been banned:\n\n" \
                 f"• Email: {user_email}\n" \
                 f"• User ID: {user_id}\n" \
                 f"• Reason: {ban_reason}\n" \
                 f"• Banned by: {banned_by or 'System'}"
        
        notification_data = {
            "user_id": user_id,
            "user_email": user_email,
            "ban_reason": ban_reason,
            "banned_by": banned_by,
            "ban_timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        return NotificationService.create_notification(
            db=db,
            notification_type="user_ban",
            title=title,
            message=message,
            user_id=user_id,
            user_email=user_email,
            notification_data=notification_data
        )
    
    @staticmethod
    def get_unread_notifications(db: Session, limit: int = 50) -> list:
        """Get unread notifications for admin panel"""
        return db.query(AdminNotification)\
                 .filter(AdminNotification.is_read == False)\
                 .order_by(AdminNotification.created_at.desc())\
                 .limit(limit)\
                 .all()
    
    @staticmethod
    def get_all_notifications(db: Session, limit: int = 100) -> list:
        """Get all notifications for admin panel"""
        return db.query(AdminNotification)\
                 .order_by(AdminNotification.created_at.desc())\
                 .limit(limit)\
                 .all()
    
    @staticmethod
    def mark_as_read(db: Session, notification_id: int) -> bool:
        """Mark a notification as read"""
        notification = db.query(AdminNotification).filter(
            AdminNotification.id == notification_id
        ).first()
        
        if notification:
            notification.is_read = True
            notification.updated_at = datetime.now(timezone.utc)
            db.commit()
            return True
        
        return False
    
    @staticmethod
    def mark_all_as_read(db: Session) -> int:
        """Mark all notifications as read"""
        updated = db.query(AdminNotification)\
                    .filter(AdminNotification.is_read == False)\
                    .update({"is_read": True, "updated_at": datetime.now(timezone.utc)})
        db.commit()
        return updated
