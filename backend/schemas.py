from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str
    confirm_password: str
    referral_code: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class EmailVerification(BaseModel):
    token: str

class ResendVerificationRequest(BaseModel):
    email: EmailStr

class MiningStatsResponse(BaseModel):
    mining_points: float
    mining_speed: float
    is_mining: bool
    last_mining_claim: Optional[datetime]
    time_until_next_claim: Optional[int]  # seconds
    points_earned_since_last_claim: float

class StartMiningResponse(BaseModel):
    message: str
    mining_stats: MiningStatsResponse

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: Optional[str] = None
    wallet_address: Optional[str]  # Allow NULL values
    referral_code: str
    referred_by: Optional[str]
    email_verified: bool
    total_earnings: Optional[float] = 0.0
    referral_earnings: Optional[float] = 0.0
    task_earnings: Optional[float] = 0.0
    level1_referrals: Optional[int] = 0
    level2_referrals: Optional[int] = 0
    level3_referrals: Optional[int] = 0
    is_active: Optional[bool] = True
    is_verified: Optional[bool] = False
    kyc_completed: Optional[bool] = False
    is_admin: Optional[bool] = False
    mining_points: Optional[float] = 0.0
    mining_speed: Optional[float] = 10.0
    last_mining_claim: Optional[datetime] = None
    is_mining: Optional[bool] = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: str
    reward: float
    task_type: str
    requirements: List[str]

class TaskCreate(TaskBase):
    is_active: bool = True

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    reward: Optional[float] = None
    task_type: Optional[str] = None
    requirements: Optional[List[str]] = None
    is_active: Optional[bool] = None

class TaskResponse(TaskBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# User Task Schemas
class UserTaskResponse(BaseModel):
    id: int
    user_id: int
    task_id: int
    is_completed: bool
    completed_at: Optional[datetime]
    reward_claimed: bool
    created_at: datetime
    updated_at: Optional[datetime]
    task: TaskResponse

    class Config:
        from_attributes = True

# Transaction Schemas
class TransactionResponse(BaseModel):
    id: int
    user_id: int
    transaction_type: str
    amount: float
    description: str
    tx_hash: Optional[str]
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

# Admin Schemas
class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    verified_users: int
    total_earnings: float
    total_referral_earnings: float
    total_task_earnings: float
    total_referrals: int
    level1_referrals: int
    level2_referrals: int
    level3_referrals: int
    total_tasks: int
    active_tasks: int
    completed_tasks: int
    recent_users: List[Dict[str, Any]]
    recent_transactions: List[Dict[str, Any]]

# System Settings Schemas
class SystemSettingsResponse(BaseModel):
    id: int
    key: str
    value: Dict[str, Any]
    description: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# KYC Schemas
class KYCVerificationBase(BaseModel):
    verification_type: str
    verification_data: Optional[Dict[str, Any]] = None

class KYCVerificationCreate(KYCVerificationBase):
    pass

class KYCVerificationResponse(KYCVerificationBase):
    id: int
    user_id: int
    status: str
    rejection_reason: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Referral Schemas
class ReferralResponse(BaseModel):
    id: int
    referrer_id: int
    referred_id: int
    level: int
    reward_amount: float
    is_paid: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# Analytics Schemas
class UserStatsResponse(BaseModel):
    total_earnings: float
    referral_earnings: float
    task_earnings: float
    total_referrals: int
    level1_referrals: int
    level2_referrals: int
    level3_referrals: int
    completed_tasks: int
    joined_at: datetime
    last_login: Optional[datetime]
    is_verified: bool
    kyc_completed: bool

class ReferralStatsResponse(BaseModel):
    referral_code: str
    referral_link: str
    total_referrals: int
    level1_referrals: int
    level2_referrals: int
    level3_referrals: int
    total_referral_earnings: float
    direct_referrals: List[Dict[str, Any]]

# Error Schemas
class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None

# Success Schemas
class SuccessResponse(BaseModel):
    message: str
    data: Optional[Dict[str, Any]] = None
