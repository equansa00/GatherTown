import React, { useEffect, useState } from 'react';
import { fetchAllEvents } from '../api/eventsService';
import AllEventsList from '../features/events/AllEventsList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import EventSearch from '../features/events/EventSearch'; // Import EventSearch

const AllEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({}); // State to hold search parameters

  useEffect(() => {
    const getAllEvents = async () => {
      try {
        const fetchedEvents = await fetchAllEvents(searchParams); // Use searchParams in the fetch call
        setEvents(fetchedEvents);
      } catch (err) {
        setError('Failed to load events');
        console.error('Error while loading events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getAllEvents();
  }, [searchParams]); // Add searchParams as a dependency to refetch events when they change

  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
  };

  const handleEventHover = (event) => {
    console.log('Event hovered:', event);
  };

  return (
    <div className="all-events-page">
      <h1>All Events</h1>
      <EventSearch setSearchParams={setSearchParams} /> {/* Event search component */}
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
