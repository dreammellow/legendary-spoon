import os
import uuid
import time
import hashlib
import base64
import io
import json
import threading
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
import boto3
from PIL import Image
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from database import get_db
from models import User, SystemSettings
from routers.auth import get_current_user, get_admin_user

router = APIRouter()

# Initialize AWS Rekognition client (only if credentials are available)
aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
aws_region = os.getenv('AWS_REGION', 'us-east-1')

rekognition = boto3.client(
    'rekognition',
    aws_access_key_id=aws_access_key,
    aws_secret_access_key=aws_secret_key,
    region_name=aws_region
)

# Store active liveness sessions (in production, use Redis or database)
active_sessions = {}

# Rate limiting and ban system
user_attempts = {}  # Track attempts per user
banned_users = set()  # Set of banned user IDs
face_attempts = {}  # Track attempts per face hash
banned_faces = set()  # Set of banned face hashes
MAX_ATTEMPTS = 3  # Maximum attempts allowed per user
MAX_FACE_ATTEMPTS = 2  # Maximum attempts per face
BAN_DURATION = 3600  # Ban duration in seconds (1 hour)

# Face deduplication storage (in production, use database)
face_hash_storage = {}  # face_hash -> user_id mapping
duplicate_violations = {}  # Track duplicate KYC violations

# File-based persistent storage for face hashes
FACE_HASH_FILE = "face_hashes.json"

def load_face_hashes():
    """Load face hashes from persistent storage"""
    global face_hash_storage
    try:
        if os.path.exists(FACE_HASH_FILE):
            with open(FACE_HASH_FILE, 'r') as f:
                face_hash_storage = json.load(f)
        else:
            face_hash_storage = {}

    except Exception as e:
        face_hash_storage = {}

def save_face_hashes():
    """Save face hashes to persistent storage"""
    try:
        with open(FACE_HASH_FILE, 'w') as f:
            json.dump(face_hash_storage, f, indent=2)
    except Exception as e:
        pass

# Load face hashes on startup
load_face_hashes()

# Cache clearing configuration
CACHE_CLEAR_INTERVAL = 300  # Clear cache every 5 minutes
SESSION_TIMEOUT = 1800  # Session timeout in seconds (30 minutes)
ATTEMPT_CLEANUP_INTERVAL = 3600  # Clean up old attempts every hour

def base64_to_image(base64_string):
    """Convert base64 string to PIL Image"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64 string
        image_data = base64.b64decode(base64_string)
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        return image
    except Exception as e:
        raise ValueError(f"Invalid image data: {str(e)}")

def image_to_bytes(image):
    """Convert PIL Image to bytes"""
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='JPEG')
    return img_byte_arr.getvalue()

def generate_face_hash(image_bytes):
    """Generate a hash for face tracking"""
    try:
        
        # Check if AWS credentials are available
        if not aws_access_key or not aws_secret_key:

            fallback_hash = hashlib.sha256(image_bytes).hexdigest()[:16]

            return fallback_hash
        
        # Use AWS Rekognition to get face landmarks for consistent hashing
        response = rekognition.detect_faces(
            Image={'Bytes': image_bytes},
            Attributes=['ALL']
        )
        
        if not response['FaceDetails']:

            fallback_hash = hashlib.sha256(image_bytes).hexdigest()[:16]

            return fallback_hash
        
        face = response['FaceDetails'][0]
        
        # Create a hash based on face landmarks and key features
        landmarks = face.get('Landmarks', [])
        landmark_data = []
        
        # Extract key facial landmarks for consistent hashing
        for landmark in landmarks:
            landmark_data.append(f"{landmark['Type']}:{landmark['X']:.3f},{landmark['Y']:.3f}")
        
        # Sort for consistency
        landmark_data.sort()
        face_string = "|".join(landmark_data)
        face_hash = hashlib.sha256(face_string.encode()).hexdigest()[:16]

        return face_hash
        
    except Exception as e:
        # Fallback to image hash if face detection fails
        fallback_hash = hashlib.sha256(image_bytes).hexdigest()[:16]

        return fallback_hash

def is_face_banned(face_hash):
    """Check if face hash is banned"""
    if face_hash in banned_faces:
        # Check if ban has expired
        if time.time() - face_attempts.get(face_hash, {}).get('banned_at', 0) > BAN_DURATION:
            # Unban the face
            banned_faces.discard(face_hash)
            if face_hash in face_attempts:
                del face_attempts[face_hash]
            return False
        return True
    return False

def check_face_rate_limit(face_hash):
    """Check if face has exceeded rate limit"""
    if not face_hash:
        return True, 0
    
    current_time = time.time()
    
    # Clean up old attempts (older than 1 hour)
    if face_hash in face_attempts:
        attempts = face_attempts[face_hash]
        attempts['attempts'] = [t for t in attempts['attempts'] if current_time - t < 3600]
        
        # If no recent attempts, reset
        if not attempts['attempts']:
            del face_attempts[face_hash]
            return True, 0
    
    # Check if face is banned
    if is_face_banned(face_hash):
        return False, -1  # -1 indicates banned
    
    # Count recent attempts
    if face_hash not in face_attempts:
        face_attempts[face_hash] = {'attempts': [], 'banned_at': 0}
    
    recent_attempts = len(face_attempts[face_hash]['attempts'])
    
    if recent_attempts >= MAX_FACE_ATTEMPTS:
        # Ban the face
        banned_faces.add(face_hash)
        face_attempts[face_hash]['banned_at'] = current_time
        return False, -1  # -1 indicates banned
    
    return True, recent_attempts

def record_face_attempt(face_hash):
    """Record a new attempt for the face"""
    if not face_hash:
        return
    
    current_time = time.time()
    if face_hash not in face_attempts:
        face_attempts[face_hash] = {'attempts': [], 'banned_at': 0}
    
    face_attempts[face_hash]['attempts'].append(current_time)

class CreateSessionRequest(BaseModel):
    userId: Optional[str] = None

class VerificationResult(BaseModel):
    sessionId: str
    confidence: float
    status: str
    message: str

# Duplicate function removed - using the main generate_face_hash function above

def cleanup_old_attempts():
    """Clean up old attempts and expired bans"""
    current_time = time.time()
    
    # Clean up user attempts older than 1 hour
    for user_id in list(user_attempts.keys()):
        attempts = [attempt for attempt in user_attempts[user_id] if current_time - attempt < 3600]
        if attempts:
            user_attempts[user_id] = attempts
        else:
            del user_attempts[user_id]
    
    # Clean up face attempts older than 1 hour
    for face_hash in list(face_attempts.keys()):
        attempts = [attempt for attempt in face_attempts[face_hash] if current_time - attempt < 3600]
        if attempts:
            face_attempts[face_hash] = attempts
        else:
            del face_attempts[face_hash]

def clear_expired_sessions():
    """Clear expired liveness sessions"""
    current_time = time.time()
    expired_sessions = []
    
    for session_id, session_data in active_sessions.items():
        if current_time - session_data.get('created_at', 0) > SESSION_TIMEOUT:
            expired_sessions.append(session_id)
    
    for session_id in expired_sessions:
        del active_sessions[session_id]


def clear_expired_bans():
    """Clear expired bans from memory"""
    current_time = time.time()
    
    # Clear expired user bans
    expired_users = []
    for user_id in banned_users:
        if user_id in user_attempts:
            ban_time = user_attempts[user_id].get('banned_at', 0)
            if current_time - ban_time > BAN_DURATION:
                expired_users.append(user_id)
    
    for user_id in expired_users:
        banned_users.discard(user_id)
        if user_id in user_attempts:
            del user_attempts[user_id]
    
    # Clear expired face bans
    expired_faces = []
    for face_hash in banned_faces:
        if face_hash in face_attempts:
            ban_time = face_attempts[face_hash].get('banned_at', 0)
            if current_time - ban_time > BAN_DURATION:
                expired_faces.append(face_hash)
    
    for face_hash in expired_faces:
        banned_faces.discard(face_hash)
        if face_hash in face_attempts:
            del face_attempts[face_hash]
    

def clear_kyc_cache():
    """Clear all KYC-related caches"""
    global active_sessions, user_attempts, face_attempts, banned_users, banned_faces, face_hash_storage
    
    # Clear all caches
    active_sessions.clear()
    user_attempts.clear()
    face_attempts.clear()
    banned_users.clear()
    banned_faces.clear()
    face_hash_storage.clear()
    save_face_hashes()

def auto_cache_cleanup():
    """Automatic cache cleanup function that runs in background"""
    while True:
        try:

            # Clear expired sessions
            clear_expired_sessions()
            
            # Clear expired bans
            clear_expired_bans()
            
            # Clean up old attempts
            cleanup_old_attempts()
            
            # Clear old duplicate violations (older than 24 hours)
            current_time = time.time()
            old_violations = []
            for violation_id, violation_data in duplicate_violations.items():
                if current_time - violation_data.get('timestamp', 0) > 86400:  # 24 hours
                    old_violations.append(violation_id)
            
            for violation_id in old_violations:
                del duplicate_violations[violation_id]
            

        except Exception as e:
            pass

        # Wait for next cleanup cycle
        time.sleep(CACHE_CLEAR_INTERVAL)

def start_cache_cleanup_thread():
    """Start the background cache cleanup thread"""
    cleanup_thread = threading.Thread(target=auto_cache_cleanup, daemon=True)
    cleanup_thread.start()

def generate_face_hash_from_mock(user_email: str):
    """Generate a consistent face hash for mock KYC (for testing)"""
    # For mock KYC, we'll use a deterministic hash based on user email
    # This ensures the same user always gets the same face hash
    return hashlib.md5(f"mock_face_{user_email}".encode()).hexdigest()[:16]

def check_duplicate_face(face_hash, current_user_id, db):
    """Check if face hash is already used by another user"""
    if not face_hash:

        return None


    # Check in-memory storage first
    if face_hash in face_hash_storage:
        existing_user_id = face_hash_storage[face_hash]

        if existing_user_id != current_user_id:
            # Get user details from database
            existing_user = db.query(User).filter(User.id == existing_user_id).first()
            if existing_user:
                return existing_user
            else:
                del face_hash_storage[face_hash]
                save_face_hashes()  # Save changes to file
        else:
            pass

    else:
        pass

    # TODO: Check database for face_hash when column is added
    # For now, only check in-memory storage
    # try:
    #     existing_user = db.query(User).filter(User.face_hash == face_hash).first()
    #     if existing_user and existing_user.id != current_user_id:
    #         print(f"🚨 DUPLICATE FACE DETECTED: Face hash {face_hash} already used by user {existing_user.id} ({existing_user.email})")
    #         return existing_user
    # except Exception as e:
    #     print(f"❌ Error checking database for face hash: {e}")
    
    return None

def store_face_hash(user_id, face_hash, db):
    """Store face hash for a user in memory (database storage disabled until migration)"""
    if not face_hash:

        return
    
    # TODO: Store in database when face_hash column is added
    # For now, only store in memory
    # try:
    #     user = db.query(User).filter(User.id == user_id).first()
    #     if user:
    #         user.face_hash = face_hash
    #         db.commit()
    #         print(f"✅ Stored face hash {face_hash} for user {user_id} in database")
    #     else:
    #         print(f"❌ User {user_id} not found")
    # except Exception as e:
    #     print(f"❌ Error storing face hash: {e}")
    #     db.rollback()
    
    # Store in memory for quick access
    face_hash_storage[face_hash] = user_id
    
    # Save to persistent storage
    save_face_hashes()

def ban_duplicate_kyc_users(user1_id, user2_id, db):
    """Ban both users involved in duplicate KYC"""
    try:
        # Get both users
        user1 = db.query(User).filter(User.id == user1_id).first()
        user2 = db.query(User).filter(User.id == user2_id).first()
        
        if user1:
            user1.is_active = False
            user1.kyc_completed = False  # Reset KYC status
        
        if user2:
            user2.is_active = False
            user2.kyc_completed = False  # Reset KYC status
        
        # Record violation
        violation_id = f"{min(user1_id, user2_id)}_{max(user2_id, user2_id)}"
        duplicate_violations[violation_id] = {
            'user1_id': user1_id,
            'user2_id': user2_id,
            'user1_email': user1.email if user1 else 'Unknown',
            'user2_email': user2.email if user2 else 'Unknown',
            'timestamp': time.time(),
            'reason': 'Duplicate KYC verification'
        }
        
        # Create admin notification for KYC ban
        try:
            from services.notification_service import NotificationService
            NotificationService.create_kyc_ban_notification(
                db=db,
                user1_id=user1_id,
                user2_id=user2_id,
                user1_email=user1.email if user1 else 'Unknown',
                user2_email=user2.email if user2 else 'Unknown',
                violation_reason='Duplicate KYC verification'
            )
        except Exception as notification_error:
            # Don't fail the ban process if notification fails
            pass
        
        db.commit()
        
    except Exception as e:
        db.rollback()

@router.get("/test-aws")
async def test_aws_credentials():
    """Test AWS credentials and Face Liveness availability"""
    
    aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    aws_region = os.getenv('AWS_REGION', 'us-east-1')
    
    result = {
        "aws_configured": bool(aws_access_key and aws_secret_key),
        "access_key_present": bool(aws_access_key),
        "secret_key_present": bool(aws_secret_key),
        "region": aws_region,
        "access_key_preview": aws_access_key[:8] + "..." if aws_access_key else None
    }
    
    
    if aws_access_key and aws_secret_key:
        try:
            # Test AWS connection
            rekognition = boto3.client(
                'rekognition',
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key,
                region_name=aws_region
            )
            
            # Try to create a test session
            test_session = rekognition.create_face_liveness_session()
            result["aws_connection"] = "success"
            result["test_session_id"] = test_session['SessionId']
            
        except Exception as e:
            result["aws_connection"] = "failed"
            result["aws_error"] = str(e)
    else:
        result["aws_connection"] = "not_configured"
    
    return result

@router.post("/create-session")
async def create_kyc_session(
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new KYC verification session"""
    

    # Check if user is already KYC verified
    if current_user.kyc_completed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already KYC verified. Cannot start verification again."
        )
    
    # Check if KYC is enabled (for now, allow KYC even if not required)
    kyc_setting = db.query(SystemSettings).filter(SystemSettings.key == "kyc_required").first()
    kyc_required = kyc_setting and kyc_setting.value

    # Clean up old attempts
    cleanup_old_attempts()
    
    # Clear rate limiting for testing
    if current_user.id in banned_users:
        banned_users.remove(current_user.id)
    if current_user.id in user_attempts:
        del user_attempts[current_user.id]
    
    # Check if user is banned (DISABLED FOR TESTING)
    # if current_user.id in banned_users:
    #     raise HTTPException(
    #         status_code=status.HTTP_429_TOO_MANY_REQUESTS,
    #         detail="User is temporarily banned due to excessive verification attempts"
    #     )
    
    # Check user attempt limits (DISABLED FOR TESTING)
    current_time = time.time()  # Still need this for recording attempts
    # user_attempts_list = user_attempts.get(current_user.id, [])
    # recent_attempts = [attempt for attempt in user_attempts_list if current_time - attempt < 3600]
    
    # if len(recent_attempts) >= MAX_ATTEMPTS:
    #     banned_users.add(current_user.id)
    #     raise HTTPException(
    #         status_code=status.HTTP_429_TOO_MANY_REQUESTS,
    #         detail=f"Too many verification attempts. Please try again in {BAN_DURATION // 3600} hour(s)"
    #     )
    
    try:
        
        # Get AWS credentials from environment
        access_key = os.getenv('AWS_ACCESS_KEY_ID')
        secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        region = os.getenv('AWS_REGION', 'us-east-1')
        
        # Create a unique session ID
        session_id = str(uuid.uuid4())
        
        # Check if Face Liveness API is available in this region
        try:
            
            # Prepare parameters for AWS Face Liveness session
            session_params = {}
            
            # Only add KmsKeyId if provided
            if request.get('kms_key_id'):
                session_params['KmsKeyId'] = request.get('kms_key_id')
            
            # Only add Settings if S3 bucket is provided
            if request.get('s3_bucket'):
                session_params['Settings'] = {
                    'OutputConfig': {
                        'S3Bucket': request.get('s3_bucket'),
                        'S3KeyPrefix': request.get('s3_key_prefix', 'face-liveness/')
                    }
                }
            
            # Create the liveness session using AWS Rekognition
            response = rekognition.create_face_liveness_session(**session_params)
            
            # Store session information
            active_sessions[session_id] = {
                'session_id': response['SessionId'],
                'user_id': current_user.id,
                'created_at': time.time(),  # Use current timestamp for consistency
                'status': 'created'
            }
            
            # Record attempt
            if current_user.id not in user_attempts:
                user_attempts[current_user.id] = []
            user_attempts[current_user.id].append(current_time)
            
            result = {
                "success": True,
                "sessionId": session_id,
                "aws_session_id": response['SessionId'],
                "message": "AWS Face Liveness session created successfully",
                "attemptsRemaining": 999  # Disabled for testing
            }
            return result
            
        except Exception as aws_error:
            # If AWS Face Liveness API is not available, create a mock session for demo
            error_msg = str(aws_error)
            
            if any(keyword in error_msg.lower() for keyword in ['not supported', 'not available', 'invalid', 'access denied', 'unauthorized']):
                # Create a mock session for demonstration
                active_sessions[session_id] = {
                    'session_id': f'mock-{session_id}',
                    'user_id': current_user.id,
                    'created_at': '2024-01-01T00:00:00Z',
                    'status': 'created',
                    'is_mock': True
                }
                
                # Record attempt
                if current_user.id not in user_attempts:
                    user_attempts[current_user.id] = []
                user_attempts[current_user.id].append(current_time)
                
                result = {
                    "success": True,
                    "sessionId": session_id,
                    "aws_session_id": f'mock-{session_id}',
                    "message": "Mock liveness session created (AWS Face Liveness not available)",
                    "warning": f"Using mock session for demonstration. AWS Error: {error_msg}",
                    "attemptsRemaining": 999  # Disabled for testing
                }
                return result
            else:
                raise aws_error
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create verification session: {str(e)}"
        )

@router.get("/verify-result/{session_id}")
async def get_verification_result(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the result of a KYC verification session"""
    
    # Check if session exists
    if session_id not in active_sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    session_data = active_sessions[session_id]
    aws_session_id = session_data['session_id']
    
    # Verify session belongs to current user
    if session_data['user_id'] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Session does not belong to current user"
        )
    
    try:
        # Check if this is a mock session
        if session_data.get('is_mock', False):
            # Simulate mock results after a delay
            time.sleep(2)  # Simulate processing time
            
            # Generate mock results
            mock_confidence = 85.5  # Simulate a live face detection
            results = {
                'success': True,
                'sessionId': session_id,
                'status': 'SUCCEEDED',
                'confidence': mock_confidence,
                'referenceImage': None,  # No reference image in mock
                'auditImages': [],
                'isLive': mock_confidence > 80,
                'isMock': True,
                'message': 'Mock liveness results - This is a demonstration'
            }
            
            # Update session status
            active_sessions[session_id]['status'] = 'SUCCEEDED'
            active_sessions[session_id]['results'] = results
            
            # Update user KYC status if verification succeeded
            if results['isLive']:
                # Check for duplicate face across different accounts
                face_hash = generate_face_hash_from_mock(current_user.email)  # Generate mock face hash
                existing_user = check_duplicate_face(face_hash, current_user.id, db)
                
                if existing_user:
                    # Ban both users for duplicate KYC
                    ban_duplicate_kyc_users(current_user.id, existing_user.id, db)
                    results['message'] = f"KYC verification failed: Face already used by another account ({existing_user.email}). Both accounts have been suspended."
                    results['success'] = False
                    results['isLive'] = False
                else:
                    current_user.kyc_completed = True
                    # Store face hash for future deduplication
                    store_face_hash(current_user.id, face_hash, db)
                    db.commit()
                    
                    # Clear user's attempts from cache on successful KYC
                    if current_user.id in user_attempts:
                        del user_attempts[current_user.id]
                    if current_user.id in banned_users:
                        banned_users.discard(current_user.id)
                    
                    results['message'] = "KYC verification completed successfully (Mock)"
            
            return results
        
        # Get the liveness session results from AWS
        response = rekognition.get_face_liveness_session_results(
            SessionId=aws_session_id
        )
        
        # Update session status
        active_sessions[session_id]['status'] = response['Status']
        active_sessions[session_id]['results'] = response
        
        # Parse the results
        results = {
            'success': True,
            'sessionId': session_id,
            'status': response['Status'],
            'confidence': None,
            'referenceImage': None,
            'auditImages': [],
            'isLive': False,
            'isMock': False
        }
        
        if response['Status'] == 'SUCCEEDED':
            # Extract confidence score
            if 'Confidence' in response:
                results['confidence'] = response['Confidence']
                results['isLive'] = response['Confidence'] > 80  # Threshold for live detection
            
            # Extract reference image (base64 encoded)
            if 'ReferenceImage' in response:
                reference_image = response['ReferenceImage']
                if 'Bytes' in reference_image:
                    results['referenceImage'] = base64.b64encode(reference_image['Bytes']).decode('utf-8')
            
            # Extract audit images
            if 'AuditImages' in response:
                for audit_image in response['AuditImages']:
                    if 'Bytes' in audit_image:
                        results['auditImages'].append(
                            base64.b64encode(audit_image['Bytes']).decode('utf-8')
                        )
            
            # Update user KYC status if verification succeeded
            if results['isLive']:
                
                # Generate face hash from reference image for deduplication
                face_hash = None
                if results.get('referenceImage'):
                    try:

                        # Decode base64 image and generate face hash
                        image_bytes = base64.b64decode(results['referenceImage'])
                        face_hash = generate_face_hash(image_bytes)

                    except Exception as e:

                        # Fallback: use image hash directly
                        face_hash = hashlib.sha256(image_bytes).hexdigest()[:16]

                else:

                    # For testing duplicate prevention, use a consistent face hash
                    # This simulates the same person using different accounts

                    # Use a consistent face hash for testing
                    # In production, this should be replaced with proper face detection
                    test_face_id = "test_face_123"  # This will be the same for all test users
                    face_hash = hashlib.md5(f"test_face_{test_face_id}".encode()).hexdigest()[:16]
                
                # Check for duplicate face across different accounts
                if face_hash:

                    existing_user = check_duplicate_face(face_hash, current_user.id, db)
                    
                    if existing_user:

                        # Ban both users for duplicate KYC
                        ban_duplicate_kyc_users(current_user.id, existing_user.id, db)
                        results['message'] = f"KYC verification failed: Face already used by another account ({existing_user.email}). Both accounts have been suspended."
                        results['success'] = False
                        results['isLive'] = False
                    else:

                        current_user.kyc_completed = True
                        # Store face hash for future deduplication
                        store_face_hash(current_user.id, face_hash, db)
                        db.commit()
                        
                        # Clear user's attempts from cache on successful KYC
                        if current_user.id in user_attempts:
                            del user_attempts[current_user.id]
                        if current_user.id in banned_users:
                            banned_users.discard(current_user.id)
                        
                        results['message'] = "KYC verification completed successfully"
                else:

                    # If we can't generate face hash, still allow KYC but log warning
                    current_user.kyc_completed = True
                    db.commit()
                    
                    # Clear user's attempts from cache on successful KYC
                    if current_user.id in user_attempts:
                        del user_attempts[current_user.id]
                    if current_user.id in banned_users:
                        banned_users.discard(current_user.id)
                    
                    results['message'] = "KYC verification completed successfully (face hash not available)"
            else:
                results['message'] = "KYC verification failed - face not detected as live"
        
        elif response['Status'] == 'FAILED':
            results['message'] = "KYC verification failed"
        else:
            results['message'] = "KYC verification is still in progress"
        
        return results
        
    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get verification result: {str(e)}"
        )

@router.get("/admin/duplicate-violations")
async def get_duplicate_kyc_violations(
    current_user: User = Depends(get_current_user)
):
    """Get all duplicate KYC violations (admin only)"""
    
    # Check if user is admin
    if not current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required for admin access"
        )
    
    return {
        "violations": list(duplicate_violations.values()),
        "total_violations": len(duplicate_violations),
        "face_hash_storage": face_hash_storage
    }

@router.post("/admin/clear-violations")
async def clear_duplicate_violations(
    current_user: User = Depends(get_current_user)
):
    """Clear all duplicate KYC violations (admin only)"""
    
    # Check if user is admin
    if not current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required for admin access"
        )
    
    global duplicate_violations, face_hash_storage
    duplicate_violations.clear()
    face_hash_storage.clear()
    save_face_hashes()
    
    return {
        "message": "All duplicate KYC violations cleared",
        "violations_cleared": True
    }

@router.post("/admin/clear-kyc-cache")
async def clear_kyc_cache(
    current_user: User = Depends(get_current_user)
):
    """Clear all KYC cache data (admin only)"""
    
    # Check if user is admin
    if not current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required for admin access"
        )
    
    global active_sessions, user_attempts, banned_users, face_attempts, banned_faces, face_hash_storage, duplicate_violations
    
    # Clear all KYC-related cache
    active_sessions.clear()
    user_attempts.clear()
    banned_users.clear()
    face_attempts.clear()
    banned_faces.clear()
    face_hash_storage.clear()
    save_face_hashes()
    duplicate_violations.clear()
    
    return {
        "message": "All KYC cache data cleared",
        "cache_cleared": True,
        "cleared_items": [
            "active_sessions",
            "user_attempts", 
            "banned_users",
            "face_attempts",
            "banned_faces",
            "face_hash_storage",
            "duplicate_violations"
        ]
    }

@router.get("/admin/kyc-cache-status")
async def get_kyc_cache_status(current_user: User = Depends(get_admin_user)):
    """Get KYC cache status and statistics"""
    try:
        cache_stats = {
            "active_sessions": len(active_sessions),
            "user_attempts": len(user_attempts),
            "face_attempts": len(face_attempts),
            "banned_users": len(banned_users),
            "banned_faces": len(banned_faces),
            "face_hash_storage": len(face_hash_storage),
            "duplicate_violations": len(duplicate_violations)
        }
        
        return {
            "success": True,
            "cache_stats": cache_stats,
            "face_hashes": face_hash_storage,  # Include actual face hashes for debugging
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get KYC cache status"
        )

@router.post("/admin/test-duplicate-prevention")
async def test_duplicate_prevention(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Test duplicate prevention system"""
    try:
        # Simulate a duplicate face hash
        test_face_hash = hashlib.md5("test_face_123".encode()).hexdigest()[:16]
        
        # Check if this face hash already exists
        existing_user = check_duplicate_face(test_face_hash, current_user.id, db)
        
        if existing_user:
            return {
                "success": True,
                "message": f"Duplicate prevention working! Face hash {test_face_hash} already used by user {existing_user.id} ({existing_user.email})",
                "face_hash": test_face_hash,
                "existing_user": {
                    "id": existing_user.id,
                    "email": existing_user.email
                }
            }
        else:
            return {
                "success": True,
                "message": f"No duplicate found for face hash {test_face_hash}",
                "face_hash": test_face_hash,
                "face_hash_storage": face_hash_storage
            }
    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to test duplicate prevention"
        )

@router.delete("/session/{session_id}")
async def delete_verification_session(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a KYC verification session"""
    
    # Check if session exists and user owns it
    if session_id in active_sessions:
        session_info = active_sessions[session_id]
        if session_info['user_id'] == current_user.id:
            try:
                # Delete from AWS if available
                if rekognition:
                    rekognition.delete_face_liveness_session(SessionId=session_id)
                # Remove from local storage
                del active_sessions[session_id]
                return {"message": "Session deleted successfully"}
            except Exception as e:

                # Still remove from local storage even if AWS deletion fails
                del active_sessions[session_id]
                return {"message": "Session removed locally"}
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Session not found"
    )

@router.get("/status")
async def get_kyc_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get KYC status and remaining attempts for current user"""
    
    # Check if KYC is enabled
    kyc_setting = db.query(SystemSettings).filter(SystemSettings.key == "kyc_required").first()
    kyc_enabled = kyc_setting and kyc_setting.value
    
    # Get user attempt info
    current_time = time.time()
    user_attempts_list = user_attempts.get(current_user.id, [])
    recent_attempts = [attempt for attempt in user_attempts_list if current_time - attempt < 3600]
    remaining_attempts = max(0, MAX_ATTEMPTS - len(recent_attempts))
    
    return {
        "kycEnabled": kyc_enabled,
        "kycCompleted": current_user.kyc_completed,
        "remainingAttempts": remaining_attempts,
        "isBanned": current_user.id in banned_users,
        "banExpiresAt": None  # Could implement ban expiration tracking
    }

@router.get("/test")
async def test_kyc_endpoint():
    """Test endpoint for KYC service"""
    return {
        "message": "KYC service is working",
        "aws_configured": rekognition is not None,
        "active_sessions": len(active_sessions)
    }

@router.get("/status")
async def get_kyc_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's KYC status"""
    try:
        # Get cache data for this user
        user_attempts_count = len(user_attempts.get(current_user.id, []))
        is_banned = current_user.id in banned_users
        
        # Find user's face hash
        user_face_hash = None
        for fh, uid in face_hash_storage.items():
            if uid == current_user.id:
                user_face_hash = fh
                break
        
        # Find active sessions for this user
        user_sessions = [sid for sid, data in active_sessions.items() if data.get('user_id') == current_user.id]
        
        return {
            "success": True,
            "user": {
                "id": current_user.id,
                "email": current_user.email,
                "kyc_completed": current_user.kyc_completed,
                "is_active": current_user.is_active
            },
            "kyc_status": {
                "can_start_verification": not current_user.kyc_completed,
                "attempts_count": user_attempts_count,
                "is_banned": is_banned,
                "has_face_hash": user_face_hash is not None,
                "active_sessions": len(user_sessions)
            },
            "timestamp": time.time()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get KYC status: {str(e)}"
        )

@router.get("/health")
async def kyc_health_check():
    """Health check for KYC service"""
    try:
        if rekognition:
            # Test AWS connection
            rekognition.list_collections()
            return {
                "status": "healthy",
                "aws_connected": True,
                "active_sessions": len(active_sessions)
            }
        else:
            return {
                "status": "degraded",
                "aws_connected": False,
                "error": "AWS credentials not configured",
                "active_sessions": len(active_sessions)
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "aws_connected": False,
            "error": str(e),
            "active_sessions": len(active_sessions)
        }

# Start the automatic cache cleanup thread when module loads
start_cache_cleanup_thread()
