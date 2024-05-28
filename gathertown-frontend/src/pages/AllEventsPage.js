// src/pages/AllEventsPage.js
import React, { useEffect, useState } from 'react';
import { fetchAllEvents } from '../api/eventsService';
import EventsList from '../features/events/EventsList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

const AllEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getAllEvents = async () => {
      try {
        const fetchedEvents = await fetchAllEvents();
        setEvents(fetchedEvents);
      } catch (err) {
        setError('Failed to load events');
        console.error('Error while loading events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getAllEvents();
  }, []);

  return (
    <div className="all-events-page">
      <h1>All Events</h1>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}
      {!isLoading && !error && (
        <EventsList
          events={events}
          setEvents={setEvents}
          setIsLoading={setIsLoading}
          setLoadError={setError}
        />
      )}
    </div>
  );
};

export default AllEventsPage;


