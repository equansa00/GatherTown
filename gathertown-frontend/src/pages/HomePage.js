// src/pages/HomePage.js
import React, { useState, useCallback, useEffect } from 'react';
import MapComponent from '../components/MapComponent';
import HomeEventsList from '../features/events/HomeEventsList';
import EventDetails from '../features/events/EventDetails';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { fetchEvents, fetchRandomEvents } from '../api/eventsService'; // Adjusted import
import './HomePage.css';

const defaultPosition = { lat: 40.730610, lng: -73.935242 };

const HomePage = () => {
  const { user} = useAuth();
  const [events, setEvents] = useState([]);
  const [position, setPosition] = useState(defaultPosition);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [useStaticMap, setUseStaticMap] = useState(false); // Toggle for static map
  const [randomEvents, setRandomEvents] = useState([]);

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

  const loadRandomEvents = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const fetchedRandomEvents = await fetchRandomEvents();
      setRandomEvents(fetchedRandomEvents);
      console.log('Random events loaded successfully:', fetchedRandomEvents);
    } catch (error) {
      console.error('Error loading random events:', error);
      setLoadError('Failed to load random events');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    loadRandomEvents();
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
          <div className="event-details">
            {selectedEvent ? (
              <>
                <EventDetails event={selectedEvent} />
                <h2>Random Events</h2>
                {randomEvents.length > 0 ? (
                  randomEvents.map(event => (
                    <div key={event._id} className="event-item">
                      <h3>{event.title}</h3>
                      <p>{new Date(event.date).toLocaleString()}</p>
                      <p>{event.location.streetAddress}, {event.location.city}, {event.location.state}, {event.location.country}, {event.location.zipCode}</p>
                    </div>
                  ))
                ) : (
                  <p>No random events found</p>
                )}
              </>
            ) : (
              <p>Select an event to see the details</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
