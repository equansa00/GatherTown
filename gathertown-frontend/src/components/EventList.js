// src/components/EventList.js
import React, { useEffect, useState } from 'react';

function EventList() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/events/all')
      .then(response => response.json())
      .then(data => setEvents(data.events));
  }, []);

  return (
    <div>
      {events.map(event => (
        <div key={event._id}>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          <p>{event.date} at {event.time}</p>
          <p>
            {event.location.streetAddress}, {event.location.city}, {event.location.state}, {event.location.country}, {event.location.zipCode}
          </p>
          <p>Category: {event.category}</p>
          <p>Organizer: {event.organizer}</p>
          <p>Price: {event.price}</p>
          <p>Tags: {event.tags.join(', ')}</p>
        </div>
      ))}
    </div>
  );
}

export default EventList;


