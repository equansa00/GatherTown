import React, { useState, useEffect } from 'react';
import { fetchEventsNearby } from '../../api/eventsService';
import HomeEventsList from './HomeEventsList';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';

const EventsNearby = ({ userLocation, onEventClick, setIsLoading, setLoadError, isLoading, loadError }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const fetchedEvents = await fetchEventsNearby(userLocation);
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error loading events:', error);
        setLoadError('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [userLocation, setIsLoading, setLoadError]);

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : loadError ? (
        <ErrorDisplay message={loadError} />
      ) : (
        <HomeEventsList
          events={events}
          onEventClick={onEventClick}
        />
      )}
    </>
  );
};

export default EventsNearby;

