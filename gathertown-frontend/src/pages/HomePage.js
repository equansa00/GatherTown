import React, { useState, useCallback, useEffect } from 'react';
import MapComponent from '../components/MapComponent';
import HomeEventsList from '../features/events/HomeEventsList';
import EventDetails from '../features/events/EventDetails';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { fetchEvents } from '../api/eventsService';
import './HomePage.css';  // Import the new CSS file

const defaultPosition = { lat: 40.730610, lng: -73.935242 };

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [position, setPosition] = useState(defaultPosition);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [useStaticMap, setUseStaticMap] = useState(false); // Toggle for static map
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

  const loadEvents = async (page = 0) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const fetchedEvents = await fetchEvents({ lat: position.lat, lng: position.lng, page });
      setEvents(fetchedEvents);
      console.log('Events loaded successfully:', fetchedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setLoadError('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [position]);

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
          <div className="event-details">
            {selectedEvent ? <EventDetails event={selectedEvent} /> : <p>Select an event to see the details</p>}
          </div>
          <div className="events-section">
            <HomeEventsList
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
          <div className="map-container">
            <MapComponent
              center={position}
              events={events}
              selectedEvent={selectedEvent}
              onMarkerClick={handleMarkerClick}
              onLoad={handleMapLoad}
              onEventHover={handleEventHover}
              useStaticMap={useStaticMap}
            />
            <button onClick={() => setUseStaticMap(!useStaticMap)}>
              Toggle {useStaticMap ? 'Interactive' : 'Static'} Map
            </button>
          </div>
        </div>
      )}
      <div className="footer">
        <p>© 2024 Community-Driven Local Event Finder. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default HomePage;
