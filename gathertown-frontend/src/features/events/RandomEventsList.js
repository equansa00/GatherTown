import React from 'react';
import PropTypes from 'prop-types';
import { handleRsvp } from '../../utils/rsvpUtils';
// import './RandomEventsList.css';

const RandomEventsList = ({ events, onEventClick, onEventHover, rsvpStatus, setRsvpStatus }) => {
  const handleEventSelect = (event) => {
    if (onEventClick) onEventClick(event);
  };

  const handleRSVPClick = async (eventId, e) => {
    e.stopPropagation();
    await handleRsvp(eventId, rsvpStatus, setRsvpStatus, console.error);
  };

  return (
    <div className="random-events">
      <h2>Random Events</h2>
      {events.length === 0 ? (
        <p>No random events found</p>
      ) : (
        events.map((event) => (
          <div
            key={event._id}
            className="event-item"
            onClick={() => handleEventSelect(event)}
            onMouseEnter={() => onEventHover(event)}
          >
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>{new Date(event.date).toLocaleString()}</p>
            <p>{event.location.streetAddress}, {event.location.city}, {event.location.state}, {event.location.country}, {event.location.zipCode}</p>
            <p>Distance: {event.distance ? `${event.distance.toFixed(2)} miles` : 'N/A'}</p>
            <button onClick={(e) => handleRSVPClick(event._id, e)}>
              {rsvpStatus.find(status => status.id === event._id)?.isRSVPed ? '✔️ RSVPed' : 'RSVP'}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

RandomEventsList.propTypes = {
  events: PropTypes.array.isRequired,
  onEventClick: PropTypes.func.isRequired,
  onEventHover: PropTypes.func,
  rsvpStatus: PropTypes.array.isRequired,
  setRsvpStatus: PropTypes.func.isRequired
};

export default RandomEventsList;
