#!/usr/bin/env python3
"""
Database migration to add Google OAuth fields to users table
Run this script to add the missing columns to the database
"""

import sqlite3
import os
from pathlib import Path

def run_migration():
    # Get the database path
    db_path = Path(__file__).parent.parent / "cryptoairdrop.db"
    
    if not db_path.exists():
        print(f"Database file not found at {db_path}")
        return False
    
    try:
        # Connect to the database
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        print("Connected to database successfully")
        
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        print(f"Existing columns: {columns}")
        
        # Add username column if it doesn't exist
        if 'username' not in columns:
            print("Adding username column...")
            cursor.execute("ALTER TABLE users ADD COLUMN username VARCHAR")
            print("✅ username column added")
        else:
            print("✅ username column already exists")
        
        # Add google_id column if it doesn't exist
        if 'google_id' not in columns:
            print("Adding google_id column...")
            cursor.execute("ALTER TABLE users ADD COLUMN google_id VARCHAR UNIQUE")
            print("✅ google_id column added")
        else:
            print("✅ google_id column already exists")
        
        # Commit the changes
        conn.commit()
        print("✅ Migration completed successfully")
        
        # Verify the changes
        cursor.execute("PRAGMA table_info(users)")
        new_columns = [column[1] for column in cursor.fetchall()]
        print(f"Updated columns: {new_columns}")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("🔄 Running database migration to add Google OAuth fields...")
    success = run_migration()
    if success:
        print("🎉 Migration completed successfully!")
    else:
        print("💥 Migration failed!")
