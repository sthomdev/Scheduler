import React, { useEffect, useState, useCallback } from 'react';
import ScheduleGrid from '../components/ScheduleGrid';
import io from 'socket.io-client'; // Import socket.io-client
import '../styles/MainView.css';

const INITIAL_SLOTS_COUNT = 72; // e.g., 24 hours * 3 slots/hour (20 min slots)
const SLOTS_PER_LOAD = 12; // Load 4 more hours (12 slots of 20 mins)

const MainView = () => {
    const [resources, setResources] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [displayDate, setDisplayDate] = useState(new Date());
    const [timeSlots, setTimeSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [socket, setSocket] = useState(null); // State for socket instance

    // Function to get the appropriate start time for the day
    const getBaseStartTime = useCallback((date) => {
        const newStartTime = new Date(date); // Use a copy to avoid unintended mutations
        if (newStartTime.toDateString() === new Date().toDateString()) { // If displayDate is 'today'
            const now = new Date();
            // Set hours and minutes from 'now' for today's date, then round
            newStartTime.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
            newStartTime.setMinutes(Math.ceil(newStartTime.getMinutes() / 30) * 30, 0, 0);
        } else { // If displayDate is not 'today' (i.e., a past or future day)
            newStartTime.setHours(0, 0, 0, 0); // Start at Midnight for other days
        }
        return newStartTime;
    }, []);

    const generateSlots = useCallback((startDateTime, numSlots) => {
        const slots = [];
        for (let i = 0; i < numSlots; i++) {
            const time = new Date(startDateTime.getTime() + i * 30 * 60 * 1000);
            slots.push(time);
        }
        return slots;
    }, []);

    // Effect to initialize or reset time slots when displayDate changes
    useEffect(() => {
        const baseStart = getBaseStartTime(displayDate);
        const initialSlotsArray = generateSlots(baseStart, INITIAL_SLOTS_COUNT);
        setTimeSlots(initialSlotsArray);
    }, [displayDate, getBaseStartTime, generateSlots, INITIAL_SLOTS_COUNT]);

    // Function to fetch resources
    const fetchResources = async () => {
        try {
            const resourcesResponse = await fetch('/resources');
            if (!resourcesResponse.ok) throw new Error('Network response for resources was not ok');
            const resourcesData = await resourcesResponse.json();
            setResources(resourcesData);
        } catch (error) {
            setError(prevError => prevError || `Error fetching resources: ${error.message}`);
            console.error('Error fetching resources:', error);
        }
    };

    // Function to fetch reservations
    const fetchReservations = async () => {
        try {
            const reservationsResponse = await fetch('/reservations');
            if (!reservationsResponse.ok) throw new Error('Network response for reservations was not ok');
            const reservationsData = await reservationsResponse.json();
            setReservations(reservationsData);
        } catch (error) {
            setError(prevError => prevError || `Error fetching reservations: ${error.message}`);
            console.error('Error fetching reservations:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null); // Clear previous errors
            try {
                await fetchResources();
                await fetchReservations();
            } catch (error) {
                setError(`Error fetching initial data: ${error.message}`);
                console.error('Error fetching initial data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []); // Removed displayDate from here, reservations are global for now

    // Socket.IO setup
    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(); // Connect to the backend Socket.IO server
        setSocket(newSocket);

        // Listen for reservation updates
        newSocket.on('reservation_update', (data) => {
            console.log('Reservation update received:', data);
            // Refetch reservations to update the view
            // More sophisticated updates could be done here (e.g., updating state directly)
            fetchReservations(); 
        });

        // Clean up the connection when the component unmounts
        return () => newSocket.close();
    }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

    const handleReservationCreated = () => {
        fetchReservations(); // This will now also be triggered by socket event, but direct call is fine for immediate feedback
    };

    const handlePreviousDay = () => {
        setDisplayDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(prevDate.getDate() - 1);
            return newDate;
        });
    };

    const handleNextDay = () => {
        setDisplayDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(prevDate.getDate() + 1);
            return newDate;
        });
    };

    const handleGoToToday = () => {
        setDisplayDate(new Date());
    };

    const loadMoreTimeSlots = (direction) => {
        // Logic to load more time slots
        // 'direction' can be 'up' or 'down' based on scroll
    };

    const handleDisplayDateChangeFromScroll = useCallback((newDate) => {
        // Check if newDate is actually different to avoid re-renders / potential loops.
        if (newDate.toDateString() !== displayDate.toDateString()) {
            setDisplayDate(newDate);
        }
    }, [displayDate]);

    const filteredResources = resources.filter(resource =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div className="loading-message">Loading...</div>;
    }
    if (error && !reservations.length && !resources.length) { // Show full page error if initial data fails
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="main-view-container">
            <h1>Resource Scheduling</h1>
            {error && <div className="error-message inline-error">{error}</div>} {/* Inline error for reservation fetch issues */}
            <div className="controls-container">
                <input
                    type="text"
                    placeholder="Search resources..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="date-navigation">
                    <button onClick={handlePreviousDay} className="date-nav-button">Previous Day</button>
                    <span className="current-date-display">{displayDate.toLocaleDateString()}</span>
                    <button onClick={handleNextDay} className="date-nav-button">Next Day</button>
                    <button onClick={handleGoToToday} className="date-nav-button today-button">Today</button>
                </div>
            </div>
            <ScheduleGrid
                resources={filteredResources}
                reservations={reservations}
                timeSlots={timeSlots}
                displayDate={displayDate} // Pass current displayDate
                onReservationCreated={handleReservationCreated}
                onDisplayDateChange={handleDisplayDateChangeFromScroll} // New callback
            />
        </div>
    );
};

export default MainView;
