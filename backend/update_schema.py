"""
Database schema update script - drops and recreates all tables
"""
import sys
sys.path.insert(0, '.')

from backend.app.database import engine, Base

# Import all models to register them with Base
from backend.app.models.user import User
from backend.app.models.chat import ChatSession, ChatMessage
from backend.app.models.user_task import UserTask

print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)

print("Creating all tables with new schema...")
Base.metadata.create_all(bind=engine)

print("Done! Database schema updated successfully.")
print("New columns added: requirements, time_spent_minutes in user_tasks table")
