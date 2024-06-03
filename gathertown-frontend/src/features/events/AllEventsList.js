// src/features/events/AllEventsList.js
import React, { useState } from 'react';
import { rsvpToEvent } from '../../api/eventsService';
import './AllEventsList.css';

const AllEventsList = ({ events, onEventClick, onEventHover }) => {
  console.log('[AllEventsList] Rendering component');
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [rsvpStatus, setRsvpStatus] = useState(events.map(event => ({ id: event._id, isRSVPed: event.isRSVPed })));

  const handleEventSelect = (event) => {
    console.log('[handleEventSelect] Event selected:', event);
    if (onEventClick) onEventClick(event);
    setExpandedEventId(event._id === expandedEventId ? null : event._id); // Toggle expansion
  };

  const handleRSVP = async (eventId, isRSVPed, e) => {
    console.log(`[handleRSVP] RSVPing to event ID: ${eventId}`);
    e.stopPropagation();
    if (isRSVPed) {
      alert('You have already RSVPed to this event.');
      return;
    }
    try {
      await rsvpToEvent(eventId);
      alert('RSVP successful!');
      console.log(`[handleRSVP] RSVP successful for event ID: ${eventId}`);
      setRsvpStatus(rsvpStatus.map(status => (status.id === eventId ? { ...status, isRSVPed: true } : status)));
    } catch (error) {
      alert('Failed to RSVP');
      console.error('[handleRSVP] RSVP error:', error);
    }
  };

  if (!Array.isArray(events) || events.length === 0) {
    console.log('[AllEventsList] No events available');
    return <p>No events available.</p>;
  }

  console.log(`[AllEventsList] Rendering ${events.length} events`);

  return (
    <div className="event-list">
      {events.map((event, index) => (
        <div
          key={event._id ? `${event._id}-${index}` : index}
          className={`event-item ${expandedEventId === event._id ? 'expanded' : ''}`}
          onClick={() => handleEventSelect(event)}
          onMouseEnter={() => onEventHover(event)}
        >
          <h3>{event.title}</h3>
          <p>{new Date(event.date).toLocaleString()}</p>
          <p>{event.location.streetAddress}, {event.location.city}, {event.location.state}, {event.location.country}, {event.location.zipCode}</p>
          {expandedEventId === event._id && (
            <div className="event-description">
              <p><strong>Description:</strong> {event.description}</p>
              <p><strong>Location:</strong> {event.location.city}, {event.location.state}, {event.location.country}, {event.location.zipCode}</p>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {event.time}</p>
            </div>
          )}
          <button onClick={(e) => handleRSVP(event._id, event.isRSVPed || rsvpStatus.find(status => status.id === event._id).isRSVPed, e)}>
            {event.isRSVPed || rsvpStatus.find(status => status.id === event._id).isRSVPed ? '✔️ RSVPed' : 'RSVP'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default AllEventsList;
