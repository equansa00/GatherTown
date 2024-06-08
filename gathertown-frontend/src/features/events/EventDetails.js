// src/features/events/EventDetails.js
import React, { useEffect, useState } from 'react';
import { fetchAddress } from '../../utils/geolocationUtils';
import UpdateEvent from './UpdateEvent';

const EventDetails = ({ event, onUpdateEvent }) => {
  const [address, setAddress] = useState('Unknown Address');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (event && event.location.coordinates) {
      const [lng, lat] = event.location.coordinates;
      fetchAddress(lat, lng).then(fetchedAddress => {
        setAddress(fetchedAddress);
      });
    }
  }, [event]);

  const handleUpdate = (updatedEvent) => {
    onUpdateEvent(updatedEvent);
    setIsEditing(false);
  };

  if (!event) {
    return <p>No event selected</p>;
  }

  return (
    <div>
      {event.images && event.images.length > 0 && (
        <img
          src={event.images[0]}
          alt={event.title}
          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
        />
      )}
      <h2>{event.title}</h2>
      <div style={{ marginTop: '20px' }}>
        <h2>Event Details</h2>
        <p>{event.description}</p>
        <p>Date: {new Date(event.date).toLocaleDateString()} at {event.time}</p>
        <p>Location: {address}</p>
        <p>Category: {event.category}</p>
        {event.isEditable && (
          <div>
            <button onClick={() => setIsEditing(!isEditing)}>Edit Event</button>
            <button>Delete Event</button>
          </div>
        )}
        {isEditing && (
          <UpdateEvent eventId={event._id} initialEventData={event} onUpdate={handleUpdate} />
        )}
      </div>
    </div>
  );
};

export default EventDetails;
