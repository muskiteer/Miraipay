"""
Database migration script to add new columns and tables
Run this after updating models.py
"""

from sqlalchemy import create_engine, text
import os

# Get database URL from environment or use default
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/stabletool")
engine = create_engine(DATABASE_URL)


def migrate():
    """Apply database migrations"""
    
    with engine.connect() as conn:
        print("Starting database migration...")
        
        # Add groq_api_key column to users table if it doesn't exist
        try:
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS groq_api_key TEXT;
            """))
            conn.commit()
            print("✓ Added groq_api_key column to users table")
        except Exception as e:
            print(f"✗ Error adding groq_api_key column: {e}")
            conn.rollback()
        
        # Create conversations table if it doesn't exist
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS conversations (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    user_message TEXT NOT NULL,
                    tool_selected VARCHAR(255),
                    tool_result TEXT,
                    final_response TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))
            conn.commit()
            print("✓ Created conversations table")
        except Exception as e:
            print(f"✗ Error creating conversations table: {e}")
            conn.rollback()
        
        # Create index on conversations.user_id for faster queries
        try:
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_conversations_user_id 
                ON conversations(user_id);
            """))
            conn.commit()
            print("✓ Created index on conversations.user_id")
        except Exception as e:
            print(f"✗ Error creating index: {e}")
            conn.rollback()
        
        print("\nMigration completed successfully!")


if __name__ == "__main__":
    migrate()
