// frontend/src/features/events/EventDetailsModal.js
import React from 'react';

const EventDetailsModal = ({ event, onClose }) => {
  return (
    <div className="modal">
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <p>Date: {new Date(event.date).toLocaleDateString()}</p>
      <p>Location: {event.location.coordinates.join(', ')}</p>
      <p>Category: {event.category}</p>
      <p>Time: {event.time}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default EventDetailsModal;
