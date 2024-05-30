import React, { useEffect, useState, useCallback } from 'react';
import { fetchRandomEvents, rsvpToEvent } from '../../api/eventsService'; // Adjusted import
import './EventsList.css';
import { getDistanceFromLatLonInMiles } from '../../utils/geolocationUtils';

const HomeEventsList = ({ 
  onEventClick, 
  onEventHover = () => {}, 
  setIsLoading, 
  loadError, 
  setLoadError,
  isLoading // Ensure this is passed correctly
}) => {
  const [eventList, setEventList] = useState([]);

  const logMessage = (message) => {
    console.log(`[HomeEventsList] ${message}`);
  };

  const loadEvents = useCallback(async () => {
    logMessage('Loading random events');

    setIsLoading(true);
    setLoadError('');

    try {
      const randomEvents = await fetchRandomEvents();
      logMessage(`Fetched ${randomEvents.length} random events from API`);

      setEventList(randomEvents);
    } catch (error) {
      logMessage(`Error loading events: ${error.message}`);
      setLoadError('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
      logMessage('Finished loading events');
    }
  }, [setIsLoading, setLoadError]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleEventSelect = (event) => {
    logMessage(`Event selected: ${event.title}`);
    onEventClick(event);
  };

  const handleRSVP = async (eventId, e) => {
    e.stopPropagation();
    try {
      const response = await rsvpToEvent(eventId);
      alert('RSVP successful!');
      console.log(`RSVP successful for event ID: ${eventId}`, response);
    } catch (error) {
      alert('Failed to RSVP');
      console.error('RSVP error:', error);
    }
  };

  return (
    <div className="events-list-container">
      <div className="events-list">
        {eventList.map((event) => (
          <div 
            key={event._id} 
            className="event-item" 
            onClick={() => handleEventSelect(event)}
            onMouseEnter={() => onEventHover(event)}
          >
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>{new Date(event.date).toLocaleString()}</p>
            <p>{event.location.address}</p>
            <p>Distance: {getDistanceFromLatLonInMiles(event.location.coordinates[1], event.location.coordinates[0]).toFixed(2)} miles</p>
            <button onClick={(e) => handleRSVP(event._id, e)}>RSVP</button>
          </div>
        ))}
      </div>
      {isLoading && <p>Loading...</p>}
      {loadError && <p>{loadError}</p>}
      {eventList.length === 0 && !isLoading && !loadError && <p>No events available</p>}
    </div>
  );
};

export default HomeEventsList;
