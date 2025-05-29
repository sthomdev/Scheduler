import sys
import os

# Add the parent directory (backend) to sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.append(PARENT_DIR)

# Utility script to create all database tables for the scheduling app
from app import app
from models import db

with app.app_context():
    db.create_all()
    print("Database tables created.")
