# Scheduling App

This project is a resource scheduling application that allows users to reserve resources for specific time periods. It features a Flask (Python) backend with Flask-SocketIO for real-time updates, and a React frontend built with Vite, using socket.io-client to connect to the backend. The database is managed with SQLAlchemy and Flask-Migrate (using SQLite initially).

## Project Structure

```
scheduling-app/
├── backend/                  # Flask backend application
│   ├── app.py                # Flask application setup, Socket.IO initialization
│   ├── models.py             # SQLAlchemy database models
│   ├── routes.py             # API endpoint definitions
│   ├── requirements.txt      # Python dependencies (Flask, Flask-SocketIO, SQLAlchemy, etc.)
│   ├──migrations/            # Flask-Migrate migration scripts
│   ├── db_scripts/           # Scripts for DB creation and population
│   │   ├── create_tables.py
│   │   └── populate_tables.py
│   └── tests/                # Backend unit tests
├── vite-project/             # React frontend application (Vite)
│   ├── public/
│   ├── src/
│   │   ├── App.jsx           # Main React app component with routing
│   │   ├── main.jsx          # Entry point for the React application
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ScheduleGrid.jsx
│   │   │   └── ReservationModal.jsx
│   │   └── pages/            # Page components
│   │       ├── MainView.jsx
│   │       └── DeviceInfoPage.jsx
│   │   └── styles/           # CSS styles
│   ├── index.html            # Main HTML file for the Vite app
│   ├── package.json          # Frontend dependencies and scripts (React, socket.io-client, Vite)
│   └── vite.config.js        # Vite configuration (including proxy to backend)
├── project_env/              # Python virtual environment (example)
└── README.md                 # This file
```

## Getting Started

### Backend Setup

1.  Navigate to the `scheduling-app/backend` directory.
2.  It's recommended to create and activate a Python virtual environment:
    ```bash
    python -m venv ../project_env 
    # On Windows (PowerShell)
    ..\project_env\Scripts\Activate.ps1
    # On macOS/Linux
    # source ../project_env/bin/activate
    ```
3.  Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Initialize the database (if setting up for the first time):
    ```bash
    # Ensure you are in the scheduling-app/backend directory
    flask db init  # Only if migrations folder doesn't exist
    flask db migrate -m "Initial migration" # Or a descriptive message
    flask db upgrade
    python db_scripts/create_tables.py # Alternative/older way, ensure models are aligned
    python db_scripts/populate_tables.py # To add initial resource data
    ```
5.  Run the Flask application (includes Socket.IO server):
    ```bash
    python app.py
    ```
    The backend will typically run on `http://127.0.0.1:5000`.

### Frontend Setup

1.  Navigate to the `scheduling-app/vite-project` directory.
2.  Install the required dependencies:
    ```bash
    npm install
    ```
3.  Start the React development server (Vite):
    ```bash
    npm run dev
    ```
    The frontend will typically be available at `http://localhost:5173` (or another port if 5173 is busy) and is proxied to the backend.

## Features

-   View a list of resources and their availability on a timeline.
-   Reserve resources for specific time slots with a description.
-   Real-time updates: Changes to reservations are reflected across all connected clients instantly using WebSockets (Flask-SocketIO and socket.io-client).
-   Click on a resource name to view a device information page (stubbed, with details like IP, ports).
-   Basic reservation conflict checking on the backend.
-   Search/filter resources by name.
-   Date navigation (previous/next day, today).

## Future Enhancements (High-Level from agent.context)

1.  **UI Enhancements:**
    *   Improve error handling and loading state indicators (especially around WebSocket connections/events).
    *   Refine CSS styling.
    *   Implement an adjustable calendar view (date pickers, time range navigation).
2.  **Backend Refinements:**
    *   Review `/availability/<int:resource_id>` endpoint (potentially redundant).
    *   Implement more robust reservation conflict checking.
3.  **Device Information Page:**
    *   Populate stubbed sections with actual data.
    *   Implement control functionalities (plots, data display, control buttons).
4.  **User Authentication and Authorization.**
5.  **Notifications for upcoming reservations.**

## License

This project is licensed under the MIT License.