#!/usr/bin/env python3
"""
Migration to add face_hash field to users table for KYC face deduplication
"""
import sqlite3
import os
from datetime import datetime

def run_migration():
    """Add face_hash column to users table"""
    
    db_path = os.path.join(os.path.dirname(__file__), '..', 'cryptoairdrop.db')
    
    if not os.path.exists(db_path):
        print(f"Database not found at: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if face_hash column already exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'face_hash' in columns:
            print("face_hash column already exists, skipping migration")
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
        
        conn.commit()
        conn.close()
        
        print(f"✅ Migration completed successfully at {datetime.now()}")
        print("   - Added face_hash column to users table")
        print("   - Created index on face_hash for performance")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        if 'conn' in locals():
            conn.close()
        return False

if __name__ == "__main__":
    run_migration()
