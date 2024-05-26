import React from 'react';

const EventListItem = ({ event, onHover, onSelect, isSelected, onRSVP }) => {
  return (
    <div 
      onMouseEnter={() => onHover(event)} 
      onClick={() => onSelect(event)} 
      style={{ border: isSelected ? '2px solid blue' : '1px solid gray', padding: '10px', margin: '10px' }}
    >
      {event.images && event.images.length > 0 && (
        event.images.map((image, index) => (
          <img src={image} alt={`${event.title}-${index}`} style={{ width: '100px', height: '100px' }} key={index} />
        ))
      )}
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p>Date: {new Date(event.date).toLocaleDateString()} at {event.time}</p>
      <p>Location: {event.address}</p>
      <button onClick={() => onRSVP(event._id)}>RSVP</button>
    </div>
  );
};

export default EventListItem;
