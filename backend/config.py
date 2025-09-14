from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database - Use SQLite for development, PostgreSQL for production
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cryptoairdrop.db")
    
    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://cryptoairdrop-frontend.onrender.com",
        "https://cryptoairdrop-platform.onrender.com"
    ]
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    
    # Blockchain
    ETHEREUM_RPC_URL: str = "https://mainnet.infura.io/v3/your-project-id"
    POLYGON_RPC_URL: str = "https://polygon-rpc.com"
    
    # Airdrop Settings
    BASE_AIRDROP_TOKENS: int = 1000
    BASE_MINING_SPEED: float = 10.0
    BASE_MINING_POINTS: int = 0
    
    # Referral System - Mining Speed and Points Only (No Tokens)
    REFERRAL_REWARDS: dict = {
        "level1SpeedBonus": 2.0,    # Points/hour bonus per direct referral
        "level1PointsBonus": 50.0,  # Instant points bonus per direct referral
        "level2SpeedBonus": 1.0,    # Points/hour bonus per level 2 referral
        "level2PointsBonus": 25.0,  # Instant points bonus per level 2 referral
        "level3SpeedBonus": 0.5,    # Points/hour bonus per level 3 referral
        "level3PointsBonus": 10.0,  # Instant points bonus per level 3 referral
    }
    
    # Admin - Replace with your actual admin wallet addresses
    ADMIN_WALLET_ADDRESSES: List[str] = [
        "0x0000000000000000000000000000000000000000"  # Replace with your admin wallet
    ]
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
