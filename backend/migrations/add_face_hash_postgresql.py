#!/usr/bin/env python3
"""
PostgreSQL Migration to add face_hash field to users table for KYC face deduplication
"""
import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from datetime import datetime

def run_migration():
    """Add face_hash column to users table in PostgreSQL"""
    
    # Get database connection details from environment
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'cryptoairdrop')
    db_user = os.getenv('DB_USER', 'postgres')
    db_password = os.getenv('DB_PASSWORD', '')
    
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            database=db_name,
            user=db_user,
            password=db_password
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if face_hash column already exists
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'face_hash'
        """)
        
        if cursor.fetchone():
            print("face_hash column already exists, skipping migration")
            cursor.close()
            conn.close()
            return True
        
        # Add face_hash column
        cursor.execute("""
            ALTER TABLE users 
            ADD COLUMN face_hash VARCHAR(255) NULL
        """)
        
        # Create index on face_hash for faster lookups
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_users_face_hash 
            ON users(face_hash)
        """)
        
        cursor.close()
        conn.close()
        
        print(f"✅ PostgreSQL Migration completed successfully at {datetime.now()}")
        print("   - Added face_hash column to users table")
        print("   - Created index on face_hash for performance")
        
        return True
        
    except Exception as e:
        print(f"❌ PostgreSQL Migration failed: {e}")
        if 'conn' in locals():
            conn.close()
        return False

if __name__ == "__main__":
    run_migration()
