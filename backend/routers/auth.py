from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
import secrets
import string
import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from database import get_db
from models import User
from schemas import UserCreate, UserResponse, Token, UserLogin, EmailVerification, ResendVerificationRequest, MiningStatsResponse, StartMiningResponse
from config import settings

# Note: Rate limiting removed to avoid scoping issues

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_referral_code(username: str = None, length: int = 8) -> str:
    """Generate a referral code based on username or random"""
    if username:
        # Use username as base, clean it and make it uppercase
        clean_username = ''.join(c.upper() for c in username if c.isalnum())
        if len(clean_username) >= 4:
            # Use first 4 chars of username + random suffix
            suffix = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(4))
            return clean_username[:4] + suffix
        else:
            # If username too short, pad with random chars
            padding = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8 - len(clean_username)))
            return clean_username + padding
    
    # Fallback to random code
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

def generate_verification_token() -> str:
    """Generate a random email verification token"""
    return secrets.token_urlsafe(32)

def send_verification_email(email: str, username: str, token: str):
    """Send email verification email"""
    try:
        # Check if SMTP is configured
        if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
            return False
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USERNAME
        msg['To'] = email
        msg['Subject'] = "Verify Your Email - CryptoAirdrop"
        
        # Create verification link
        verification_link = f"{settings.ALLOWED_ORIGINS[0]}/verify-email?token={token}"
        
        # Email body
        body = f"""
        <html>
        <body>
            <h2>Welcome to CryptoAirdrop, {username}!</h2>
            <p>Thank you for registering with us. To complete your registration and start earning tokens, please verify your email address by clicking the link below:</p>
            <p><a href="{verification_link}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email Address</a></p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{verification_link}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
            <br>
            <p>Best regards,<br>The CryptoAirdrop Team</p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Send email
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(settings.SMTP_USERNAME, email, text)
        server.quit()
        
        return True
    except Exception as e:

        # Log the verification link for development
        verification_link = f"{settings.ALLOWED_ORIGINS[0]}/verify-email?token={token}"

        return False

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return user_id
    except JWTError:
        raise credentials_exception

def get_current_user(user_id: str = Depends(verify_token), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Check if user is banned
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended due to policy violation. Please contact support."
        )
    
    return user

def get_admin_user(current_user: User = Depends(get_current_user)):
    """Get current user and verify admin status - for development, allow any verified user"""
    # For development purposes, allow any verified user to access admin endpoints
    # In production, you should check current_user.is_admin
    if not current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required for admin access"
        )
    return current_user

@router.post("/register", response_model=dict)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user for the airdrop"""
    
    # Validate password confirmation
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Generate unique referral code based on username
    referral_code = generate_referral_code(user_data.username)
    while db.query(User).filter(User.referral_code == referral_code).first():
        referral_code = generate_referral_code()  # Fallback to random if username-based is taken
    
    # Generate email verification token
    verification_token = generate_verification_token()
    verification_expires = datetime.now(timezone.utc) + timedelta(hours=24)

    # Create new user with email verification
    db_user = User(
        email=user_data.email,
        wallet_address=None,  # No wallet address initially
        referral_code=referral_code,
        referred_by=user_data.referral_code if user_data.referral_code else None,
        email_verified=False,
        email_verification_token=verification_token,
        email_verification_expires=verification_expires
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Send verification email (with fallback to console)
    email_sent = send_verification_email(user_data.email, user_data.username, verification_token)

    # Generate verification link for development
    verification_link = f"http://localhost:3000/verify-email?token={verification_token}"

    return {
        "message": "Registration successful! Please check your email to verify your account.",
        "email_sent": email_sent,
        "user_id": db_user.id,
        "referral_code": referral_code,
        "verification_link": verification_link
    }

@router.post("/check-user")
async def check_user(request: dict, db: Session = Depends(get_db)):
    """Check if user exists and return token if they do"""
    
    email = request.get('email')
    name = request.get('name')
    image = request.get('image')
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended"
        )
    
    # Update user info if provided
    if name and user.username != name:
        user.username = name
    if image:
        # Store image URL if needed (you might want to add an image_url field to User model)
        pass
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "email_verified": user.email_verified,
            "referred_by": user.referred_by
        }
    }

@router.post("/login", response_model=Token)
async def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    """Login user with email and password"""
    
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # For now, skip password verification since password_hash field doesn't exist
    # In production, you should implement proper password verification
    
    # Check if email is verified (temporarily disabled for testing)
    # if not user.email_verified:
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail="Please verify your email address before logging in. Check your inbox for the verification email."
    #     )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended due to policy violation. Please contact support for assistance."
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/check-ban-status")
async def check_ban_status(request: dict, db: Session = Depends(get_db)):
    """Check if a user is banned by email (for OAuth integration)"""
    try:
        email = request.get('email')
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return {"is_banned": False, "message": "User not found"}
        
        return {
            "is_banned": not user.is_active,
            "user_id": user.id,
            "email": user.email,
            "message": "Account suspended due to policy violation. Please contact support for assistance." if not user.is_active else "User is active"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check ban status: {str(e)}"
        )

@router.post("/verify-email", response_model=dict)
async def verify_email(verification_data: EmailVerification, db: Session = Depends(get_db)):
    """Verify user email with token"""

    # Note: Rate limiting removed to avoid scoping issues
    # The frontend double-call prevention should handle most cases
    
    try:
        # Handle development tokens (dev-{user_id})
        if verification_data.token.startswith("dev-"):
            try:
                user_id = int(verification_data.token.split("-")[1])
                user = db.query(User).filter(User.id == user_id).first()
                if not user:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid verification token"
                    )
                
                # For development, actually verify the user
                user.email_verified = True
                user.email_verification_token = None
                user.email_verification_expires = None
                user.updated_at = datetime.now(timezone.utc)  # Update timestamp for tracking
                
                # Process referral if applicable (only after email verification)
                if user.referred_by:
                    await process_referral(db, user.referred_by, user.id)
                
                # Award base airdrop tokens (only after email verification)
                await award_base_tokens(db, user.id)
                
                db.commit()

                return {
                    "message": "Email verified successfully! You can now log in to your account.",
                    "user_id": user.id,
                    "status": "verified"
                }
            except (ValueError, IndexError):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid verification token"
                )
        
        # Handle real verification tokens

        # Debug: Check all users with verification tokens
        all_users_with_tokens = db.query(User).filter(User.email_verification_token.isnot(None)).all()
        
        user = db.query(User).filter(
            User.email_verification_token == verification_data.token
        ).first()
        
        if not user:

            # Check if this might be a token that was already used (user is verified but token is null)
            # This can happen if user clicks the link multiple times or React StrictMode causes double calls
            
            # Look for recently verified users (within last 5 minutes) who might have used this token
            from datetime import timedelta
            recent_time = datetime.now(timezone.utc) - timedelta(minutes=5)
            recently_verified = db.query(User).filter(
                User.email_verified == True,
                User.updated_at >= recent_time
            ).all()
            
            
            # If we find recently verified users, this is likely a double-call issue
            if recently_verified:

                return {
                    "message": "Email verification completed! You can now log in to your account.",
                    "status": "already_verified",
                    "already_verified": True
                }
            
            # If no recently verified users, this might be a genuine invalid token
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token. Please request a new verification email."
            )

        # Check if token is expired
        if user.email_verification_expires:
            # Ensure both datetimes are timezone-aware for comparison
            expires_time = user.email_verification_expires
            if expires_time.tzinfo is None:
                # If timezone-naive, assume UTC
                expires_time = expires_time.replace(tzinfo=timezone.utc)
            
            if expires_time < datetime.now(timezone.utc):

                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Verification token has expired. Please request a new one."
                )
        
        # Check if already verified
        if user.email_verified:

            return {
                "message": "Email is already verified! You can log in to your account.",
                "user_id": user.id,
                "already_verified": True,
                "status": "already_verified"
            }
        
        # Verify email
        user.email_verified = True
        user.email_verification_token = None
        user.email_verification_expires = None
        user.updated_at = datetime.now(timezone.utc)  # Update timestamp for tracking
        
        try:
            # Process referral if applicable (only after email verification)
            if user.referred_by:
                await process_referral(db, user.referred_by, user.id)
            
            # Award base airdrop tokens (only after email verification)
            await award_base_tokens(db, user.id)
        except Exception as e:
            # Continue with verification even if referral/token processing fails
            pass
        
        db.commit()

        return {
            "message": "Email verified successfully! You can now log in to your account.",
            "user_id": user.id,
            "status": "verified"
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions as they are
        raise
    except Exception as e:

        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during verification. Please try again."
        )

@router.get("/test")
async def test_endpoint():
    """Test endpoint to verify router is working"""
    return {"message": "Auth router is working", "status": "ok"}

@router.get("/debug-verification/{token}")
async def debug_verification(token: str, db: Session = Depends(get_db)):
    """Debug endpoint to check verification token status"""

    # Check if it's a dev token
    if token.startswith("dev-"):
        try:
            user_id = int(token.split("-")[1])
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                return {
                    "token_type": "development",
                    "user_id": user.id,
                    "email": user.email,
                    "email_verified": user.email_verified,
                    "token": user.email_verification_token,
                    "expires": user.email_verification_expires
                }
        except:
            pass
    
    # Check real token
    user = db.query(User).filter(User.email_verification_token == token).first()
    if user:
        return {
            "token_type": "real",
            "user_id": user.id,
            "email": user.email,
            "email_verified": user.email_verified,
            "token": user.email_verification_token,
            "expires": user.email_verification_expires,
            "is_expired": user.email_verification_expires and (
                user.email_verification_expires.replace(tzinfo=timezone.utc) if user.email_verification_expires.tzinfo is None 
                else user.email_verification_expires
            ) < datetime.now(timezone.utc)
        }
    
    return {
        "token_type": "not_found",
        "message": "Token not found in database"
    }

@router.post("/resend-verification")
async def resend_verification_email(request: ResendVerificationRequest, db: Session = Depends(get_db)):
    """Resend verification email"""

    user = db.query(User).filter(User.email == request.email).first()
    if not user:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Generate new verification token
    verification_token = generate_verification_token()
    verification_expires = datetime.now(timezone.utc) + timedelta(hours=24)

    user.email_verification_token = verification_token
    user.email_verification_expires = verification_expires
    db.commit()
    db.refresh(user)

    # Send verification email (with fallback to console)
    email_sent = send_verification_email(user.email, user.email, verification_token)
    
    verification_link = f"http://localhost:3000/verify-email?token={verification_token}"

    return {
        "message": "Verification email sent successfully!",
        "email_sent": email_sent
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.put("/update-profile", response_model=dict)
async def update_user_profile(
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile information"""
    
    username = request.get('username')
    email = request.get('email')
    
    if not username and not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one field (username or email) is required"
        )
    
    # Check if email is being changed and if it's already taken
    if email and email != current_user.email:
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
        current_user.email = email
    
    # Update username if provided
    if username:
        current_user.username = username
    
    # Update timestamp
    current_user.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username
        }
    }

@router.get("/admin/users")
async def get_all_users(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)"""
    try:
        users = db.query(User).all()
        return {
            "users": users,
            "total": len(users)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching users: {str(e)}"
        )

@router.get("/admin/stats")
async def get_admin_stats(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get admin statistics (admin only)"""
    try:
        users = db.query(User).all()
        
        total_users = len(users)
        verified_users = len([u for u in users if u.email_verified])
        active_users = len([u for u in users if u.is_active])
        mining_users = len([u for u in users if u.is_mining])
        
        total_earnings = sum(u.total_earnings or 0 for u in users)
        total_referral_earnings = sum(u.referral_earnings or 0 for u in users)
        total_task_earnings = sum(u.task_earnings or 0 for u in users)
        total_mining_points = sum(u.mining_points or 0 for u in users)
        
        total_referrals = sum((u.level1_referrals or 0) + (u.level2_referrals or 0) + (u.level3_referrals or 0) for u in users)
        
        return {
            "total_users": total_users,
            "verified_users": verified_users,
            "active_users": active_users,
            "mining_users": mining_users,
            "total_earnings": total_earnings,
            "total_referral_earnings": total_referral_earnings,
            "total_task_earnings": total_task_earnings,
            "total_mining_points": total_mining_points,
            "total_referrals": total_referrals,
            "average_earnings": total_earnings / total_users if total_users > 0 else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching admin stats: {str(e)}"
        )

@router.put("/admin/users/{user_id}")
async def update_user(
    user_id: int,
    user_data: dict,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update user information (admin only)"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user fields
    if "wallet_address" in user_data:
        user.wallet_address = user_data["wallet_address"]
    if "total_earnings" in user_data:
        user.total_earnings = user_data["total_earnings"]
    if "is_active" in user_data:
        # Prevent admin users from being banned through admin panel
        if user.is_admin and not user_data["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin users cannot be banned through the admin panel. Use the user panel for admin bans."
            )
        user.is_active = user_data["is_active"]
    if "email_verified" in user_data:
        user.email_verified = user_data["email_verified"]
    
    db.commit()
    db.refresh(user)
    
    return {
        "message": "User updated successfully",
        "user": user
    }

@router.post("/admin/users/{user_id}/unban")
async def unban_user(
    user_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Unban a user (admin only) - works for all users including admins"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is already active
    if user.is_active:
        return {
            "message": f"User {user.email} is already active (not banned)",
            "user": user
        }
    
    # Unban the user (works for both regular users and admins)
    user.is_active = True
    db.commit()
    db.refresh(user)
    
    return {
        "message": f"User {user.email} has been successfully unbanned!",
        "user": user
    }

@router.post("/admin/users/{user_id}/ban")
async def ban_user(
    user_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Ban a user (admin only) - prevents banning admin users"""
    
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
            "message": f"User {user.email} is already banned",
            "user": user
        }
    
    # Ban the user
    user.is_active = False
    db.commit()
    db.refresh(user)
    
    return {
        "message": f"User {user.email} has been successfully banned!",
        "user": user
    }

@router.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete user (admin only)"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Delete user
    db.delete(user)
    db.commit()
    
    return {
        "message": "User deleted successfully"
    }

@router.get("/mining/stats", response_model=MiningStatsResponse)
async def get_mining_stats(current_user: User = Depends(get_current_user)):
    """Get user's mining statistics"""
    now = datetime.now(timezone.utc)
    
    # Calculate points earned since last claim
    points_earned = 0.0
    time_until_next_claim = None
    
    if current_user.is_mining and current_user.last_mining_claim:
        # Ensure last_mining_claim is timezone-aware for comparison
        last_claim = current_user.last_mining_claim
        if last_claim.tzinfo is None:
            last_claim = last_claim.replace(tzinfo=timezone.utc)
        time_since_last_claim = (now - last_claim).total_seconds()
        hours_since_last_claim = time_since_last_claim / 3600
        
        if hours_since_last_claim >= 24:
            # 24 hours have passed, can claim
            points_earned = current_user.mining_speed * 24
        else:
            # Still mining, calculate partial points
            points_earned = current_user.mining_speed * hours_since_last_claim
            time_until_next_claim = int((24 * 3600) - time_since_last_claim)
    
    return MiningStatsResponse(
        mining_points=current_user.mining_points,
        mining_speed=current_user.mining_speed,
        is_mining=current_user.is_mining,
        last_mining_claim=current_user.last_mining_claim,
        time_until_next_claim=time_until_next_claim,
        points_earned_since_last_claim=points_earned
    )

@router.post("/mining/start", response_model=StartMiningResponse)
async def start_mining(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Start or claim mining"""
    now = datetime.now(timezone.utc)
    
    if current_user.is_mining and current_user.last_mining_claim:
        # Ensure last_mining_claim is timezone-aware for comparison
        last_claim = current_user.last_mining_claim
        if last_claim.tzinfo is None:
            last_claim = last_claim.replace(tzinfo=timezone.utc)
        time_since_last_claim = (now - last_claim).total_seconds()
        hours_since_last_claim = time_since_last_claim / 3600
        
        if hours_since_last_claim >= 24:
            # Claim mining rewards
            points_earned = current_user.mining_speed * 24
            current_user.mining_points += points_earned
            current_user.last_mining_claim = now
            
            message = f"Successfully claimed {points_earned:.2f} mining points!"
        else:
            # Still mining, can't claim yet
            remaining_hours = 24 - hours_since_last_claim
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Please wait {remaining_hours:.1f} more hours before claiming mining rewards."
            )
    else:
        # Start new mining session
        current_user.is_mining = True
        current_user.last_mining_claim = now
        message = "Mining started! You can claim rewards after 24 hours."
    
    db.commit()
    
    # Get updated mining stats
    mining_stats = await get_mining_stats(current_user)
    
    return StartMiningResponse(
        message=message,
        mining_stats=mining_stats
    )

@router.post("/mining/update-speed")
async def update_mining_speed(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update mining speed based on referral levels"""
    # Calculate mining speed based on referral levels
    # Use configurable base speed and referral bonuses
    base_speed = settings.BASE_MINING_SPEED
    level1_bonus = current_user.level1_referrals * settings.REFERRAL_REWARDS.get("level1SpeedBonus", 2.0)
    level2_bonus = current_user.level2_referrals * settings.REFERRAL_REWARDS.get("level2SpeedBonus", 1.0)
    level3_bonus = current_user.level3_referrals * settings.REFERRAL_REWARDS.get("level3SpeedBonus", 0.5)
    
    new_speed = base_speed + level1_bonus + level2_bonus + level3_bonus
    current_user.mining_speed = new_speed
    
    db.commit()
    
    return {
        "message": f"Mining speed updated to {new_speed:.1f} points/hour",
        "mining_speed": new_speed,
        "level1_referrals": current_user.level1_referrals,
        "level2_referrals": current_user.level2_referrals,
        "level3_referrals": current_user.level3_referrals
    }

async def update_mining_speed_for_user(db: Session, user_id: int):
    """Update mining speed for a specific user based on their referral levels"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return
    
    # Calculate mining speed based on referral levels using configurable values
    base_speed = settings.BASE_MINING_SPEED
    level1_bonus = user.level1_referrals * settings.REFERRAL_REWARDS.get("level1SpeedBonus", 2.0)
    level2_bonus = user.level2_referrals * settings.REFERRAL_REWARDS.get("level2SpeedBonus", 1.0)
    level3_bonus = user.level3_referrals * settings.REFERRAL_REWARDS.get("level3SpeedBonus", 0.5)
    
    new_speed = base_speed + level1_bonus + level2_bonus + level3_bonus
    user.mining_speed = new_speed

async def process_referral(db: Session, referral_code: str, new_user_id: int):
    """Process referral and award mining speed/points rewards (no tokens)"""
    referrer = db.query(User).filter(User.referral_code == referral_code).first()
    if not referrer:
        return
    
    # Update referral counts
    referrer.level1_referrals += 1
    
    # Award mining speed bonus instead of tokens
    # Level 1 referrals get configurable points/hour mining speed bonus
    mining_speed_bonus = settings.REFERRAL_REWARDS.get("level1SpeedBonus", 2.0)
    referrer.mining_speed += mining_speed_bonus
    
    # Award some mining points as bonus
    points_bonus = settings.REFERRAL_REWARDS.get("level1PointsBonus", 50.0)
    referrer.mining_points += points_bonus

    # Process level 2 and 3 referrals if applicable
    if referrer.referred_by:
        await process_level2_referral(db, referrer.referred_by, new_user_id)
    
    # Update mining speed based on new referral
    await update_mining_speed_for_user(db, referrer.id)
    
    db.commit()

async def process_level2_referral(db: Session, referral_code: str, new_user_id: int):
    """Process level 2 referral - award mining speed/points (no tokens)"""
    referrer = db.query(User).filter(User.referral_code == referral_code).first()
    if not referrer:
        return
    
    referrer.level2_referrals += 1
    
    # Award mining speed bonus instead of tokens
    # Level 2 referrals get configurable points/hour mining speed bonus
    mining_speed_bonus = settings.REFERRAL_REWARDS.get("level2SpeedBonus", 1.0)
    referrer.mining_speed += mining_speed_bonus
    
    # Award some mining points as bonus
    points_bonus = settings.REFERRAL_REWARDS.get("level2PointsBonus", 25.0)
    referrer.mining_points += points_bonus

    # Process level 3 if applicable
    if referrer.referred_by:
        await process_level3_referral(db, referrer.referred_by, new_user_id)
    
    # Update mining speed based on new referral
    await update_mining_speed_for_user(db, referrer.id)
    
    db.commit()

async def process_level3_referral(db: Session, referral_code: str, new_user_id: int):
    """Process level 3 referral - award mining speed/points (no tokens)"""
    referrer = db.query(User).filter(User.referral_code == referral_code).first()
    if not referrer:
        return
    
    referrer.level3_referrals += 1
    
    # Award mining speed bonus instead of tokens
    # Level 3 referrals get configurable points/hour mining speed bonus
    mining_speed_bonus = settings.REFERRAL_REWARDS.get("level3SpeedBonus", 0.5)
    referrer.mining_speed += mining_speed_bonus
    
    # Award some mining points as bonus
    points_bonus = settings.REFERRAL_REWARDS.get("level3PointsBonus", 10.0)
    referrer.mining_points += points_bonus

    # Update mining speed based on new referral
    await update_mining_speed_for_user(db, referrer.id)
    
    db.commit()

async def award_base_tokens(db: Session, user_id: int):
    """Award base airdrop tokens and mining setup to new user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return
    
    # Award base airdrop tokens
    user.total_earnings += settings.BASE_AIRDROP_TOKENS
    
    # Set base mining speed and points from config
    user.mining_speed = settings.BASE_MINING_SPEED
    user.mining_points = settings.BASE_MINING_POINTS

    db.commit()

@router.post("/submit-referral", response_model=dict)
async def submit_referral_code(
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit referral code for Google OAuth users"""
    
    referral_code = request.get('referral_code')
    
    if not referral_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Referral code is required"
        )
    
    # Check if user already has a referral code set
    if current_user.referred_by:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Referral code already set for this user"
        )
    
    # Validate referral code exists
    referrer = db.query(User).filter(User.referral_code == referral_code).first()
    if not referrer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid referral code"
        )
    
    # Check if user is trying to refer themselves
    if referrer.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot use your own referral code"
        )
    
    # Set the referral code
    current_user.referred_by = referral_code
    db.commit()
    
    # Process referral rewards
    await process_referral(db, referral_code, current_user.id)

    return {
        "message": "Referral code submitted successfully!",
        "referral_code": referral_code,
        "referrer_email": referrer.email
    }

@router.post("/google-oauth", response_model=dict)
async def handle_google_oauth(
    request: dict,
    db: Session = Depends(get_db)
):
    """Handle Google OAuth user creation/login"""
    
    email = request.get('email')
    name = request.get('name', '')
    google_id = request.get('google_id')
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == email).first()
    
    if existing_user:
        # User exists, generate token for login
        access_token = create_access_token(data={"sub": str(existing_user.id)})
        
        return {
            "message": "Login successful",
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": existing_user.id,
            "is_new_user": False
        }
    
    # Create new user
    username = name.split()[0] if name else email.split('@')[0]
    
    referral_code = generate_referral_code(username)
    
    # Ensure referral code is unique
    while db.query(User).filter(User.referral_code == referral_code).first():
        referral_code = generate_referral_code()
    
    new_user = User(
        email=email,
        username=username,
        wallet_address=None,
        referral_code=referral_code,
        referred_by=None,  # Will be set later via referral modal
        email_verified=True  # Google OAuth users are pre-verified
        # google_id=google_id  # Temporarily disabled
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Award base tokens
    await award_base_tokens(db, new_user.id)
    
    # Generate access token
    access_token = create_access_token(data={"sub": str(new_user.id)})

    return {
        "message": "Registration successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "referral_code": referral_code,
        "is_new_user": True
    }

@router.post("/forgot-password")
async def forgot_password(request: dict, db: Session = Depends(get_db)):
    """Send password reset OTP to user's email"""
    email = request.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is required"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Don't reveal if email exists or not for security
        return {"message": "If the email exists, a password reset code has been sent."}
    
    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    # Store OTP in user record (in production, use a separate table with expiration)
    user.email_verification_token = otp
    user.email_verification_expires = datetime.now(timezone.utc) + timedelta(minutes=10)  # 10 minutes expiry
    db.commit()
    
    # Send email with OTP
    try:
        await send_password_reset_email(email, otp)

    except Exception as e:
        # Still return success to not reveal email existence
        pass
    
    return {"message": "If the email exists, a password reset code has been sent."}

@router.post("/reset-password")
async def reset_password(request: dict, db: Session = Depends(get_db)):
    """Reset password using OTP verification"""
    email = request.get("email")
    otp = request.get("otp")
    new_password = request.get("new_password")
    
    if not all([email, otp, new_password]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email, OTP, and new password are required"
        )
    
    # Validate password strength
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    # Find user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify OTP
    if not user.email_verification_token or user.email_verification_token != otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    # Check if OTP is expired
    if user.email_verification_expires and user.email_verification_expires < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one."
        )
    
    # Hash new password
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash(new_password)
    
    # Update password and clear OTP
    user.password_hash = hashed_password
    user.email_verification_token = None
    user.email_verification_expires = None
    user.updated_at = datetime.now(timezone.utc)
    
    db.commit()

    return {"message": "Password reset successfully"}

async def send_password_reset_email(email: str, otp: str):
    """Send password reset OTP email"""
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USERNAME
        msg['To'] = email
        msg['Subject'] = "Password Reset Verification Code"
        
        # Email body
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #4F46E5;">Password Reset Request</h2>
                <p>You have requested to reset your password. Use the verification code below to complete the process:</p>
                
                <div style="background-color: #f8f9fa; border: 2px solid #4F46E5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px; margin: 0;">{otp}</h1>
                </div>
                
                <p><strong>Important:</strong></p>
                <ul>
                    <li>This code will expire in 10 minutes</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>For security, never share this code with anyone</li>
                </ul>
                
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                    If you're having trouble, contact our support team.
                </p>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Send email
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(settings.SMTP_USERNAME, email, text)
        server.quit()
        
    except Exception as e:
        raise e
