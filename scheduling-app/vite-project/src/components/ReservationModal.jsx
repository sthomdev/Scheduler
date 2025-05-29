import React, { useState, useEffect } from 'react';
import '../styles/ReservationModal.css';

const ReservationModal = ({ isOpen, onClose, resource, timeSlot, onReserve }) => {
    const [durationMinutes, setDurationMinutes] = useState(30); // Default to 30 minutes
    const [description, setDescription] = useState('');

    // Reset state when modal opens for a new reservation
    useEffect(() => {
        if (isOpen) {
            setDurationMinutes(30); // Reset to default
            setDescription('');   // Reset to default
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!resource || !timeSlot) {
            alert("Error: Resource or time slot not selected.");
            return;
        }
        // Basic validation for duration
        const currentDuration = parseInt(durationMinutes, 10);
        if (currentDuration <= 0) {
            alert("Please enter a valid duration greater than 0 minutes.");
            return;
        }

        // Round up to the nearest 30 minutes
        const roundedDuration = Math.ceil(currentDuration / 30) * 30;

        onReserve(resource, timeSlot, roundedDuration, description);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Reserve {resource.name}</h2>
                <p>
                    <strong>Time:</strong> {new Date(timeSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on {new Date(timeSlot).toLocaleDateString()}
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="modal-form-group">
                        <label htmlFor="duration">Duration (minutes):</label>
                        <input
                            type="number"
                            id="duration"
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(e.target.value)}
                            min="1" // HTML5 validation for minimum value
                            required
                        />
                    </div>
                    <div className="modal-form-group">
                        <label htmlFor="description">Description:</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional: Add a brief description"
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="modal-button secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="modal-button primary">
                            Confirm Reservation
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReservationModal;
