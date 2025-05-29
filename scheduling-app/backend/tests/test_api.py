import unittest
import json
from datetime import datetime
from app import app, db
from models import Resource, Reservation

class APITestCase(unittest.TestCase):
    def setUp(self):
        # Configure the app for testing
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:' # Use in-memory SQLite for tests
        self.client = app.test_client()

        # Create tables and app context
        with app.app_context():
            db.create_all()
            self.populate_db()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def populate_db(self):
        # Add some sample data
        resource1 = Resource(name='Test Device 1')
        resource2 = Resource(name='Test Device 2')
        db.session.add_all([resource1, resource2])
        db.session.commit()

        reservation1 = Reservation(
            resource_id=resource1.id,
            start_time=datetime(2025, 5, 28, 10, 0, 0),
            end_time=datetime(2025, 5, 28, 11, 0, 0)
        )
        reservation2 = Reservation(
            resource_id=resource2.id,
            start_time=datetime(2025, 5, 28, 12, 0, 0),
            end_time=datetime(2025, 5, 28, 13, 0, 0)
        )
        db.session.add_all([reservation1, reservation2])
        db.session.commit()

    def test_get_resources(self):
        print("\n--- Testing GET /resources ---")
        response = self.client.get('/resources')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, 'application/json')
        
        data = json.loads(response.data.decode('utf-8'))
        print("Response JSON:", json.dumps(data, indent=2))
        
        self.assertIsInstance(data, list)
        self.assertTrue(len(data) >= 2) # Assuming populate_db adds at least 2
        for resource in data:
            self.assertIn('id', resource)
            self.assertIn('name', resource)
            self.assertIsInstance(resource['id'], int)
            self.assertIsInstance(resource['name'], str)

    def test_get_reservations(self):
        print("\n--- Testing GET /reservations ---")
        response = self.client.get('/reservations')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content_type, 'application/json')
        
        data = json.loads(response.data.decode('utf-8'))
        print("Response JSON:", json.dumps(data, indent=2))
        
        self.assertIsInstance(data, list)
        self.assertTrue(len(data) >= 2) # Assuming populate_db adds at least 2
        for reservation in data:
            self.assertIn('id', reservation)
            self.assertIn('resource_id', reservation)
            self.assertIn('start_time', reservation)
            self.assertIn('end_time', reservation)
            self.assertIsInstance(reservation['id'], int)
            self.assertIsInstance(reservation['resource_id'], int)
            self.assertIsInstance(reservation['start_time'], str) # Dates are serialized to strings
            self.assertIsInstance(reservation['end_time'], str)

if __name__ == '__main__':
    unittest.main()
