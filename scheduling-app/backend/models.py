from flask_sqlalchemy import SQLAlchemy
from datetime import timezone # Added import for timezone

db = SQLAlchemy()

class Resource(db.Model):
    """
    Resource model for the database.
    """
    __tablename__ = 'resources'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    ip_address = db.Column(db.String(45))  # Max length for IPv6 is 39, IPv4 is 15. 45 gives some room.
    ssh_port = db.Column(db.Integer)
    web_port = db.Column(db.Integer)
    reservations = db.relationship('Reservation', backref='resource', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'ip_address': self.ip_address,
            'ssh_port': self.ssh_port,
            'web_port': self.web_port
        }

class Reservation(db.Model):
    """
    Reservation model for the database.
    """
    __tablename__ = 'reservations'
    
    id = db.Column(db.Integer, primary_key=True)
    resource_id = db.Column(db.Integer, db.ForeignKey('resources.id'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String(200), nullable=True) # New field for reservation description

    def to_dict(self):
        # Assuming self.start_time and self.end_time are naive datetime objects
        # representing UTC time (due to SQLite storage convention).
        # Convert them to aware UTC datetime objects before calling isoformat().
        start_utc_iso = self.start_time.replace(tzinfo=timezone.utc).isoformat()
        end_utc_iso = self.end_time.replace(tzinfo=timezone.utc).isoformat()
        
        return {
            'id': self.id,
            'resource_id': self.resource_id,
            'start_time': start_utc_iso, # Now correctly includes UTC offset
            'end_time': end_utc_iso,     # Now correctly includes UTC offset
            'description': self.description # Include description in the dictionary
        }