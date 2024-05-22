import React from 'react';

function EventListItem({ event, onHover, onSelect, isSelected, onRSVP }) {
    return (
        <div
          onMouseEnter={() => onHover(event)}
          onClick={() => onSelect(event)}
          style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ccc' }}
        >
          <h3>{event.title}</h3>
          {isSelected && (
            <>
              <p>{event.description}</p>
              <p>Date: {new Date(event.date).toLocaleDateString()} at {event.time}</p>
              <p>Location: {event.location.address || `${event.location.coordinates[1]}, ${event.location.coordinates[0]}`}</p>
              <button onClick={(e) => {
                e.stopPropagation();  // Prevent onSelect trigger when RSVPing
                onRSVP(event._id);
              }}>RSVP</button>
            </>
          )}
        </div>
    );
}

export default EventListItem;
