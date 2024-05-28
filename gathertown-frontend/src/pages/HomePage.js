import React, { useState, useCallback, useEffect } from 'react';
import MapComponent from '../components/MapComponent';
import EventsList from '../features/events/EventsList';
import EventDetails from '../features/events/EventDetails';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

const defaultPosition = { lat: 40.730610, lng: -73.935242 };

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [position, setPosition] = useState(defaultPosition);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const { user } = useAuth();
  console.log('HomePage: user:', user);

  const handleEventClick = useCallback((event) => {
    setSelectedEvent(event);
  }, []);

  const handleEventHover = useCallback((event) => {
    console.log('Event hovered:', event);
  }, []);

  const handleMarkerClick = useCallback((event) => {
    setSelectedEvent(event);
  }, []);

  const handleMapLoad = useCallback((mapInstance) => {
    console.log('Map loaded:', mapInstance);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setEvents([]); // Assuming no events are fetched
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    <div className="outer-container">
      <div className="header">
        {user && <p>Welcome, {user.username}!</p>}
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : loadError ? (
        <ErrorDisplay message={loadError} />
      ) : (
        <div className="main-content">
          <div className="map-container">
            <MapComponent
              center={position}
              events={events}
              selectedEvent={selectedEvent}
              onMarkerClick={handleMarkerClick}
              onLoad={handleMapLoad}
              onEventHover={handleEventHover}
            />
          </div>
          <div className="events-section">
            <EventsList
              onEventClick={handleEventClick}
              onEventHover={handleEventHover}
              userLocation={position}
              setPosition={setPosition}
              setEvents={setEvents}
              setIsLoading={setIsLoading}
              setLoadError={setLoadError}
            />
            <p>Showing events based on {selectedEvent ? `selected event: ${selectedEvent.title}` : 'current location'}</p>
          </div>
          <div className="event-details">
            {selectedEvent ? <EventDetails event={selectedEvent} /> : <p>Select an event to see the details</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
