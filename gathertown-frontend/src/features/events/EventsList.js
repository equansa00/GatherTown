// src/features/events/EventsList.js
import React from 'react';
import { rsvpToEvent } from '../../api/eventsService'; // Ensure this import is correct
import './EventsList.css';

const EventsList = ({ events, onEventClick, onEventHover }) => {
  const handleEventSelect = (event) => {
    if (onEventClick) onEventClick(event);
    console.log('Event selected:', event);
  };

  const handleRSVP = async (eventId, e) => {
    e.stopPropagation();
    try {
      await rsvpToEvent(eventId);
      alert('RSVP successful!');
      console.log(`RSVP successful for event ID: ${eventId}`);
    } catch (error) {
      alert('Failed to RSVP');
      console.error('RSVP error:', error);
    }
  };

  if (!events || events.length === 0) {
    return <p>No events available.</p>;
  }

  return (
    <div className="event-list">
      {events.map((event, index) => (
        <div
          key={event._id ? `${event._id}-${index}` : index}
          className="event-item"
          onClick={() => handleEventSelect(event)}
          onMouseEnter={() => onEventHover(event)}
        >
          <h3>{event.title}</h3>
          <p>{new Date(event.date).toLocaleString()}</p>
          <p>{event.location.address}</p>
          <button onClick={(e) => handleRSVP(event._id, e)}>RSVP</button>
        </div>
      ))}
    </div>
  );
};

export default EventsList;
