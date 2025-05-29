import sys
import os
import json

# Add the parent directory (backend) to sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(SCRIPT_DIR)
sys.path.append(PARENT_DIR)

from app import app, db
from models import Resource

def populate_resources():
    with app.app_context():
        # Optional: Clear existing resources if you want to start fresh each time
        # Resource.query.delete()
        # db.session.commit()

        with open('db_scripts/dummy_data.json', 'r') as f:
            dummy_data = json.load(f)

        for item in dummy_data:
            # Check if resource already exists by name to avoid duplicates
            existing_resource = Resource.query.filter_by(name=item.get('name')).first()
            if not existing_resource:
                resource = Resource(
                    name=item.get('name'),
                    ip_address=item.get('ip_address'),
                    ssh_port=item.get('ssh_port'),
                    web_port=item.get('web_port')
                )
                db.session.add(resource)
            else:
                print(f"Resource '{item.get('name')}' already exists. Skipping.")
        
        try:
            db.session.commit()
            print(f"Successfully added/updated {len(dummy_data)} resources from dummy_data.json")
        except Exception as e:
            db.session.rollback()
            print(f"Error populating resources: {e}")

if __name__ == '__main__':
    populate_resources()
