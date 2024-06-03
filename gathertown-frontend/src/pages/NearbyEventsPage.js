// src/pages/NearbyEventsPage.js

import React, { useState, useEffect } from 'react';
import { fetchNearbyEvents } from '../api/eventsService'; // Implement this service
import AllEventsList from '../features/events/AllEventsList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

const NearbyEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async (lat, lng) => {
      try {
        const response = await fetchNearbyEvents(lat, lng);
        setEvents(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load events');
        console.error('Error while loading events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchEvents(latitude, longitude);
      },
      (error) => {
        setError('Failed to get your location');
        setIsLoading(false);
      }
    );
  }, []);

  return (
    <div className="nearby-events-page">
      <h1>Nearby Events</h1>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}
      {!isLoading && !error && (
        <AllEventsList events={events} />
      )}
    </div>
  );
};

export default NearbyEventsPage;
