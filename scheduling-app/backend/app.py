from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from flask_socketio import SocketIO
from flasgger import Swagger
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

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "Scheduling API",
        "description": "API for managing resources and reservations. Navigate to /apidocs/ to see the Swagger UI.",
        "version": "1.0.0"
    },
    "definitions": {
        "Resource": {
            "type": "object",
            "properties": {
                "id": {"type": "integer", "description": "Resource ID"},
                "name": {"type": "string", "description": "Name of the resource"},
                "description": {"type": "string", "description": "Description of the resource", "nullable": True}
            },
            "required": ["id", "name"]
        },
        "Reservation": {
            "type": "object",
            "properties": {
                "id": {"type": "integer", "description": "Reservation ID"},
                "resource_id": {"type": "integer", "description": "ID of the reserved resource"},
                "start_time": {"type": "string", "format": "date-time", "description": "Start time of the reservation (ISO 8601)"},
                "end_time": {"type": "string", "format": "date-time", "description": "End time of the reservation (ISO 8601)"},
                "description": {"type": "string", "description": "Optional description for the reservation", "nullable": True}
            },
            "required": ["id", "resource_id", "start_time", "end_time"]
        },
        "ReservationRequest": { # Added definition for the request body used in /reserve
            "type": "object",
            "required": [
                "resource_id",
                "start_time",
                "duration_minutes"
            ],
            "properties": {
                "resource_id": {
                    "type": "integer",
                    "description": "ID of the resource to reserve"
                },
                "start_time": {
                    "type": "string",
                    "format": "date-time",
                    "description": "Start time of the reservation in ISO format"
                },
                "duration_minutes": {
                    "type": "integer",
                    "description": "Duration of the reservation in minutes"
                },
                "description": {
                    "type": "string",
                    "description": "Optional description for the reservation",
                    "nullable": True
                }
            }
        }
    }
}

swagger = Swagger(app, template=swagger_template) # Initialize Flasgger with the template

# Initialize routes (db is already imported and initialized)
init_routes(app, db, socketio)

if __name__ == '__main__':
    socketio.run(app, debug=True, host="0.0.0.0", port=5001)