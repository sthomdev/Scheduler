from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from flask_socketio import SocketIO
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Import db instance from models.py
from models import db, Resource, Reservation # Import Resource and Reservation here as well if needed directly in app.py, or ensure they are imported where used.
from routes import init_routes

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///resources.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize db with the app
db.init_app(app)

migrate = Migrate(app, db)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize routes (db is already imported and initialized)
init_routes(app, db, socketio)

if __name__ == '__main__':
    socketio.run(app, debug=True)