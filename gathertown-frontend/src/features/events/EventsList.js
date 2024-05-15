import axios from 'axios';
import React, { useState, useEffect } from 'react';

function EventsList() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        const response = await axios.get('http://localhost:5000/api/events');
        console.log("Fetched events data:", response.data);
        if (Array.isArray(response.data)) {
          setEvents(response.data);
        } else {
          console.error("Expected an array of events, but got:", response.data);
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div>
      {isLoading && <p>Loading events...</p>}
      {error && <p>Error: {error.message}</p>}
      {!isLoading && !error && events.map(event => (
        <div key={event._id}>{event.title}</div>
      ))}
    </div>
  );
}

export default EventsList;
