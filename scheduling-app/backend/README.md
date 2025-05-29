# Scheduling App Backend

This is the backend component of the Scheduling App, built using Flask. The backend is responsible for handling API requests, managing the database, and serving data to the frontend.

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd scheduling-app/backend
   ```

2. **Create a virtual environment:**
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies:**
   ```
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```
   python app.py
   ```

## API Usage

### Endpoints

- **GET /api/resources**
  - Fetches a list of all resources and their availability.

- **POST /api/reserve**
  - Reserves a resource for a specified duration. Requires resource ID and reservation details in the request body.

- **GET /api/availability**
  - Checks the availability of a resource for a given time period.

## Database

The backend uses a relational database to store resources and reservations. The database schema is defined in `database/schema.sql`.

## Extending the App

This backend is designed to be extensible. You can add new features by creating additional routes, models, and database interactions as needed.