from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    # Only include fields that exist in the current database
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, nullable=True)  # For Google OAuth users
    wallet_address = Column(String, nullable=True)  # Allow NULL for users without wallet
    referral_code = Column(String, unique=True, index=True, nullable=False)
    referred_by = Column(String, nullable=True)
    # google_id = Column(String, nullable=True, unique=True)  # For Google OAuth - temporarily disabled
    
    # Email verification fields
    email_verified = Column(Boolean, default=False)
    email_verification_token = Column(String, nullable=True)
    email_verification_expires = Column(DateTime(timezone=True), nullable=True)
    
    # Earnings
    total_earnings = Column(Float, default=0.0)
    referral_earnings = Column(Float, default=0.0)
    task_earnings = Column(Float, default=0.0)
    
    # Referral counts
    level1_referrals = Column(Integer, default=0)
    level2_referrals = Column(Integer, default=0)
    level3_referrals = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    kyc_completed = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)  # Admin status
    
    # KYC Face tracking (temporarily disabled - using in-memory storage)
    # face_hash = Column(String, nullable=True, index=True)  # Unique face identifier for deduplication
    
    # Mining fields - using default values for now
    mining_points = Column(Float, default=0.0, server_default='0.0')
    mining_speed = Column(Float, default=10.0, server_default='10.0')  # points per hour
    last_mining_claim = Column(DateTime(timezone=True), nullable=True)
    is_mining = Column(Boolean, default=False, server_default='false')

class AdminNotification(Base):
    __tablename__ = "admin_notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)  # 'kyc_ban', 'user_ban', 'system_alert', etc.
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_email = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    notification_data = Column(JSON, nullable=True)  # Additional data like violation details
    
    # Relationships removed since related models don't exist

class SystemSettings(Base):
    __tablename__ = "system_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(JSON, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
