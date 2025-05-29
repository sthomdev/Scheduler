## Project Overview

**Goal:** Develop a resource scheduling application.
**Core Components:**
*   **Database:** SQLAlchemy with Flask-SQLAlchemy (SQLite initially).
*   **Backend:** Flask (Python) API with Flask-SocketIO for real-time updates.
*   **Frontend:** React with Vite and socket.io-client.
**Core Concept:** Users can reserve resources for specific durations. The main UI is a table with resources as rows and time slots as columns, showing availability. Device status and information will be displayed to the user. Real-time updates ensure all users see schedule changes without manual refreshes.

## Key Implemented Features

1.  **Project Setup & Backend Basics:**
    *   Initial Flask app structure (`app.py`, `models.py`, `routes.py`).
    *   SQLAlchemy and Flask-Migrate initialized for database management.
    *   `Resource` model: `id`, `name`, `ip_address`, `ssh_port`, `web_port`.
    *   `Reservation` model: `id`, `resource_id`, `start_time`, `end_time`, `description`.
    *   `to_dict()` methods in models for JSON serialization (ensuring UTC ISO strings for datetimes).
    *   Database seeding scripts (`create_tables.py`, `populate_tables.py` with `dummy_data.json`).

2.  **Frontend Migration to Vite:**
    *   React frontend migrated from a standard setup to Vite.
    *   Key files: `main.jsx`, `index.html`, `App.jsx`.
    *   Components: `MainView.jsx`, `ScheduleGrid.jsx`, `ReservationModal.jsx`.
    *   `vite.config.js` configured with a proxy for API requests to the Flask backend, including WebSocket proxying for Socket.IO.

3.  **API Endpoints (in `backend/routes.py`):**
    *   `GET /resources`: Fetches all resources.
    *   `GET /reservations`: Fetches all reservations.
    *   `POST /reserve`: Creates a new reservation. Handles `resource_id`, `start_time`, `duration_minutes`, `description`. Calculates `end_time`. Includes basic conflict checking. Emits `reservation_update` via Socket.IO.
    *   `DELETE /reservations/<reservation_id>`: Deletes a specified reservation. Emits `reservation_update` via Socket.IO.
    *   `GET /resources/<resource_id>`: Fetches details for a specific resource (for Device Info Page).

4.  **Scheduling Interface & Logic (Frontend - primarily in `vite-project/src`):**
    *   `MainView.jsx`:
        *   Fetches resources and reservations on load.
        *   Manages `displayDate` and `timeSlots` states.
        *   Includes functions for date navigation (`handlePreviousDay`, `handleNextDay`, `handleGoToToday`).
        *   Handles loading more time slots (`loadMoreTimeSlots`) for infinite scroll.
        *   Handles date changes from scroll (`handleDisplayDateChangeFromScroll`).
        *   Includes a search input to filter resources.
        *   `INITIAL_SLOTS_COUNT` is `72`, `SLOTS_PER_LOAD` is `8`.
        *   `getBaseStartTime` logic refined for intuitive start times.
        *   Connects to backend Socket.IO server and listens for `reservation_update` events to refresh reservation data automatically.
    *   `ScheduleGrid.jsx`:
        *   Renders the main scheduling table.
        *   Cells colored to indicate availability.
        *   Reserved cells display reservation details and span multiple time slots.
        *   Clicking an available cell opens `ReservationModal`.
        *   Clicking a reserved cell prompts for cancellation.
        *   Implements scroll event listener for infinite scroll and dynamic date updates.
        *   Links resource names to `DeviceInfoPage`.
    *   `ReservationModal.jsx`:
        *   Form to input reservation `duration` and `description`.
        *   Submits data to the `/reserve` endpoint.
    *   Data refresh mechanism in place after creating or deleting reservations (enhanced by WebSockets).
    *   Styling improvements in `MainView.css` and `ScheduleGrid.css`.
    *   `ScheduleGrid.css`: `.schedule-grid-container` has `overflow-x: auto;`. Table does not have `width: 100%;`.

5.  **Real-time Updates (WebSockets):**
    *   Integrated `Flask-SocketIO` on the backend and `socket.io-client` on the frontend.
    *   Backend emits `reservation_update` events when reservations are created or deleted.
    *   Frontend (`MainView.jsx`) listens for these events and automatically refreshes reservation data, providing real-time synchronization across clients.
    *   `vite.config.js` updated to correctly proxy WebSocket connections.
    *   Dependencies added to `requirements.txt` and `package.json`.

6.  **Device Information Page:**
    *   `DeviceInfoPage.jsx` and `DeviceInfoPage.css` created with stubs for plots, data, and controls.
    *   Routing set up in `App.jsx`.

7.  **Dependencies & Setup:**
    *   `react-router-dom` installed and configured for navigation.
    *   `Flask-SocketIO` and `socket.io-client` installed and configured.

8.  **API Testing:**
    *   Basic `unittest` tests in `tests/test_api.py` for `GET /resources` and `GET /reservations`.

## Key File Paths

*   **Backend:**
    *   `scheduling-app/backend/app.py`: Flask application setup, DB initialization, Socket.IO initialization, migration config.
    *   `scheduling-app/backend/models.py`: SQLAlchemy models (`Resource`, `Reservation`), `db` instance.
    *   `scheduling-app/backend/routes.py`: API endpoint definitions, Socket.IO event emission.
    *   `scheduling-app/backend/requirements.txt`: Python dependencies (includes `Flask-SocketIO`).
    *   `scheduling-app/backend/migrations/`: Flask-Migrate directory.
*   **Frontend (Vite):**
    *   `scheduling-app/vite-project/vite.config.js`: Vite configuration (including proxy for HTTP and WebSockets).
    *   `scheduling-app/vite-project/package.json`: Frontend dependencies and scripts (includes `socket.io-client`).
    *   `scheduling-app/vite-project/src/main.jsx`: Entry point for React app.
    *   `scheduling-app/vite-project/src/pages/MainView.jsx`: Main page component, Socket.IO client setup and event handling.
    *   `scheduling-app/vite-project/src/pages/DeviceInfoPage.jsx`: Device details page.
    *   `scheduling-app/vite-project/src/components/ScheduleGrid.jsx`: Core scheduling table display.
    *   `scheduling-app/vite-project/src/components/ReservationModal.jsx`: Modal for creating reservations.
    *   `scheduling-app/vite-project/src/styles/`: CSS files.

## Current State & Next Steps

*   **Primary Focus:** Verify and test the newly implemented real-time update functionality using WebSockets. Ensure that changes made by one user are reflected for other users without manual refreshes.
*   **Secondary Focus:** Continue with finalizing scrollbar behavior in `ScheduleGrid.jsx` if still relevant after WebSocket integration.
*   **Next Step:** Populate the stubbed sections in `DeviceInfoPage.jsx` with actual data and implement the control functionalities (plots, data display, and control buttons).

## High-Level Pending Tasks

1.  **Real-time Updates:** Implemented using Flask-SocketIO and socket.io-client. Requires thorough testing.
2.  **UI Enhancements:**
    *   Improve error handling and loading state indicators (especially around WebSocket connections/events).
    *   Refine CSS styling.
    *   Implement an adjustable calendar view (date pickers, time range navigation).
3.  **Backend Refinements:**
    *   Review `/availability/<int:resource_id>` endpoint (potentially redundant).
    *   Implement more robust reservation conflict checking (current check is basic).
4.  **Database Migrations:** Solid baseline established. Continue to use `flask db migrate/upgrade` for schema changes.
