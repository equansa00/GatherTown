import React, { useState, useCallback, useEffect } from 'react';
import MapComponent from '../components/MapComponent';
import HomeEventsList from '../features/events/HomeEventsList';
import EventDetails from '../features/events/EventDetails';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { fetchEvents } from '../api/eventsService';
import './HomePage.css';

const defaultPosition = { lat: 40.7128, lng: -74.0060 }; // New York City Coordinates

const HomePage = ({
  isLoading,
  setIsLoading,
  loadError,
  setLoadError,
  userLocation,
  externalEventClick,
  externalEventHover
}) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [position, setPosition] = useState(userLocation || defaultPosition);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [useStaticMap, setUseStaticMap] = useState(false);

  const handleInternalEventClick = useCallback((event) => {
    setSelectedEvent(event);
    setPosition({ lat: event.location.coordinates[1], lng: event.location.coordinates[0] });
    if (externalEventClick) {
      externalEventClick(event);
    }
  }, [externalEventClick]);

  const handleMarkerClick = useCallback((event) => {
    setSelectedEvent(event);
  }, []);

  const handleMapLoad = useCallback((mapInstance) => {
    console.log('Map loaded:', mapInstance);
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const fetchedEvents = await fetchEvents({ lat: position.lat, lng: position.lng });
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setLoadError('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [position]); // Fetch events whenever the position changes

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
              onEventHover={externalEventHover}
              useStaticMap={useStaticMap}
            />
            <button onClick={() => setUseStaticMap(!useStaticMap)}>
              Toggle {useStaticMap ? 'Interactive' : 'Static'} Map
            </button>
          </div>
          <div className="events-section">
            <HomeEventsList
              onEventClick={handleInternalEventClick}
              onEventHover={externalEventHover}
              setIsLoading={setIsLoading}
              loadError={loadError}
              setLoadError={setLoadError}
              userLocation={position} 
            />
            <p>Showing events based on {selectedEvent ? `selected event: ${selectedEvent.title}` : 'current location'}</p>
          </div>
          <div className="event-details">
            {selectedEvent ? <EventDetails eventId={selectedEvent._id} /> : <p>Select an event to see the details</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
