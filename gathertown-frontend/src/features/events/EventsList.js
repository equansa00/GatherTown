// frontend/src/features/events/EventsList.js
import React, { useState, useEffect } from 'react';
import { fetchEvents } from '../../api/eventsService';

function EventsList() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchAllEvents = async () => {
      try {
        const eventsData = await fetchEvents();
        setEvents(eventsData);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllEvents();
  }, []);

  return (
    <div>
      {isLoading && <p>Loading events...</p>}
      {error && <p>Error: {error.message}</p>}
      {!isLoading && !error && events.map(event => (
        <div key={event._id}>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          <p>Date: {new Date(event.date).toLocaleDateString()}</p>
          <p>Location: {event.location.coordinates.join(', ')}</p>
          <p>Category: {event.category}</p>
          <p>Time: {event.time}</p>
        </div>
      ))}
    </div>
  );
}

export default EventsList;
