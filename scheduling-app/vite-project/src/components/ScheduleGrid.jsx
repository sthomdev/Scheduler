import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useCallback
import { Link } from 'react-router-dom';
import ReservationModal from './ReservationModal';
import '../styles/ScheduleGrid.css';

const TIME_SLOT_COLUMN_WIDTH = 80; // Assuming 80px as defined in CSS for min-width

const ScheduleGrid = ({ resources, reservations, timeSlots, displayDate, onReservationCreated, onDisplayDateChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const gridContainerRef = useRef(null);
    const prevScrollLeft = useRef(0); // To track scroll direction

    const getReservationForCell = (resourceId, timeSlot) => {
        return reservations.find(reservation => {
            const reservationStart = new Date(reservation.start_time);
            const reservationEnd = new Date(reservation.end_time);
            const slotTime = new Date(timeSlot);
            return reservation.resource_id === resourceId &&
                   slotTime >= reservationStart && slotTime < reservationEnd;
        });
    };

    const isReserved = (resourceId, timeSlot) => {
        return reservations.some(reservation => {
            const reservationStart = new Date(reservation.start_time);
            const reservationEnd = new Date(reservation.end_time);
            const slotTime = new Date(timeSlot);
            return reservation.resource_id === resourceId &&
                   slotTime >= reservationStart && slotTime < reservationEnd;
        });
    };

    const handleCellClick = (resource, timeSlot) => {
        const existingReservation = getReservationForCell(resource.id, timeSlot);

        if (existingReservation) {
            // If the cell is part of an existing reservation, ask to cancel
            if (window.confirm(`Do you want to cancel the reservation for "${existingReservation.description || 'this slot'}" on ${resource.name}?`)) {
                handleCancelReservation(existingReservation.id);
            }
        } else {
            // If the cell is available, open the reservation modal
            setSelectedResource(resource);
            setSelectedTimeSlot(timeSlot);
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedResource(null);
        setSelectedTimeSlot(null);
    };

    const handleReserve = async (resource, timeSlot, durationMinutes, description) => { // Add description parameter
        console.log(`Attempting to reserve resource ${resource.id} at ${timeSlot.toISOString()} for ${durationMinutes} minutes with description: ${description}`);
        try {
            const response = await fetch('/reserve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resource_id: resource.id,
                    start_time: timeSlot.toISOString(), // Send ISO string
                    duration_minutes: durationMinutes,
                    description: description, // Send description
                }),
            });

            const responseData = await response.json(); // Always try to parse JSON

            if (!response.ok) {
                // Use error message from backend if available, otherwise a generic one
                const errorMessage = responseData.error || `HTTP error! status: ${response.status}`;
                throw new Error(errorMessage);
            }

            alert(`Resource ${resource.name} reserved successfully!`);
            if (onReservationCreated) {
                onReservationCreated(); // Callback to refresh reservations in MainView
            }
        } catch (error) {
            console.error('Failed to make reservation:', error);
            alert(`Failed to make reservation: ${error.message}`);
        } finally {
            handleCloseModal();
        }
    };

    const handleCancelReservation = async (reservationId) => {
        console.log(`Attempting to cancel reservation ${reservationId}`);
        try {
            const response = await fetch(`/reservations/${reservationId}`, {
                method: 'DELETE',
            });

            const responseData = await response.json();

            if (!response.ok) {
                const errorMessage = responseData.error || `HTTP error! status: ${response.status}`;
                throw new Error(errorMessage);
            }

            alert(responseData.message || 'Reservation cancelled successfully!');
            if (onReservationCreated) {
                onReservationCreated(); // Refresh reservations in MainView
            }
        } catch (error) {
            console.error('Failed to cancel reservation:', error);
            alert(`Failed to cancel reservation: ${error.message}`);
        }
    };

    const checkAndHandleDateChange = useCallback(() => {
        if (!gridContainerRef.current || !timeSlots || timeSlots.length === 0 || !displayDate) {
            return;
        }

        const { scrollLeft } = gridContainerRef.current;
        const firstVisibleSlotIndex = Math.floor(scrollLeft / TIME_SLOT_COLUMN_WIDTH);

        if (firstVisibleSlotIndex >= 0 && firstVisibleSlotIndex < timeSlots.length) {
            const firstVisibleSlotDate = new Date(timeSlots[firstVisibleSlotIndex]);
            const currentDisplayDate = new Date(displayDate);

            // Normalize to compare dates only (ignore time)
            firstVisibleSlotDate.setHours(0, 0, 0, 0);
            currentDisplayDate.setHours(0, 0, 0, 0);

            if (firstVisibleSlotDate.getTime() !== currentDisplayDate.getTime()) {
                // If the first visible slot is on a different day than the current displayDate,
                // update displayDate to the date of the first visible slot.
                if (onDisplayDateChange) {
                    onDisplayDateChange(new Date(timeSlots[firstVisibleSlotIndex])); // Pass the actual slot time
                }
            }
        }
    }, [timeSlots, displayDate, onDisplayDateChange]);

    // Reset scroll position when timeSlots are reset (e.g., on date change from MainView buttons)
    useEffect(() => {
        if (gridContainerRef.current) {
            // Check if the reset is due to a manual date change in MainView
            // This is a heuristic: if the first slot's date doesn't match displayDate, it's likely a reset.
            if (timeSlots.length > 0 && displayDate) {
                const firstSlotDay = new Date(timeSlots[0]);
                firstSlotDay.setHours(0,0,0,0);
                const currentDisplayDay = new Date(displayDate);
                currentDisplayDay.setHours(0,0,0,0);

                if (firstSlotDay.getTime() === currentDisplayDay.getTime()) {
                     // Only reset scroll if the timeslots actually correspond to the displayDate's beginning
                     // (or the relevant start time for that day as per getBaseStartTime)
                    gridContainerRef.current.scrollLeft = 0;
                }
            }
        }
    }, [timeSlots, displayDate]); // Rerun when timeSlots array reference changes or displayDate changes


    return (
        <div className="schedule-grid-container" ref={gridContainerRef}>
            <table>
                <thead>
                    <tr>
                        <th>Resource</th>
                        {timeSlots.map((slot, index) => (
                            <th key={index}>{slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {resources.map(resource => (
                        <tr key={resource.id}>
                            <td>
                                <Link to={`/device/${resource.id}`} className="resource-link">
                                    {resource.name}
                                </Link>
                            </td>
                            {timeSlots.map((slot, index) => {
                                const reserved = isReserved(resource.id, slot);
                                const reservationInfo = reservations.find(r =>
                                    r.resource_id === resource.id &&
                                    new Date(r.start_time) <= slot &&
                                    new Date(r.end_time) > slot
                                );                                

                                let cellContent = '\u00A0'; // Default to non-breaking space for empty cells
                                let cellClassName = `time-slot-cell ${reserved ? 'reserved' : 'available'}`;
                                let colSpan = 1;

                                if (reservationInfo) {
                                    const startTime = new Date(reservationInfo.start_time);
                                    const endTime = new Date(reservationInfo.end_time);
                                    
                                    // Display description only in the first slot of the reservation
                                    if (slot.getTime() === startTime.getTime()) {
                                        cellContent = reservationInfo.description || 'Reserved';
                                        // Calculate colspan
                                        const startIndex = timeSlots.findIndex(ts => ts.getTime() === startTime.getTime());
                                        let endIndex = timeSlots.findIndex(ts => ts.getTime() === endTime.getTime());
                                        
                                        if (endIndex === -1) { // If reservation ends beyond currently loaded slots
                                            endIndex = timeSlots.length; // Span until the end of loaded slots
                                        }

                                        if (startIndex !== -1) {
                                            colSpan = endIndex - startIndex;
                                            if (colSpan <= 0) colSpan = 1; // Ensure colSpan is at least 1
                                        }
                                    } else {
                                        // This cell is part of an ongoing reservation but not the start
                                        // It should be skipped as it's covered by colspan
                                        return null; 
                                    }
                                }

                                return (
                                    <td
                                        key={`${resource.id}-${slot.toISOString()}`}
                                        className={cellClassName}
                                        onClick={() => handleCellClick(resource, slot)} 
                                        colSpan={colSpan > 1 ? colSpan : undefined}
                                    >
                                        {cellContent}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            {isModalOpen && selectedResource && selectedTimeSlot && (
                <ReservationModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    resource={selectedResource}
                    timeSlot={selectedTimeSlot}
                    onReserve={handleReserve}
                />
            )}
        </div>
    );
};

export default ScheduleGrid;
