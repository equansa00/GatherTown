import React, { useEffect, useState } from 'react';
import { fetchAllEvents } from '../api/eventsService';
import AllEventsList from '../features/events/AllEventsList';
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

  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
    // Add your event click handling logic here
  };

  const handleEventHover = (event) => {
    console.log('Event hovered:', event);
    // Add your event hover handling logic here
  };

  return (
    <div className="all-events-page">
      <h1>All Events</h1>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}
      {!isLoading && !error && (
        <AllEventsList
          events={events}
          onEventClick={handleEventClick}
          onEventHover={handleEventHover}
        />
      )}
    </div>
  );
};

export default AllEventsPage;
