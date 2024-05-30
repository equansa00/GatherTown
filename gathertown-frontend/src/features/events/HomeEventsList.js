import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchEvents } from '../../api/eventsService';
import './EventsList.css';
import { getDistanceFromLatLonInMiles } from '../../utils/geolocationUtils';

const HomeEventsList = ({ 
  onEventClick, 
  onEventHover = () => {}, 
  userLocation, 
  setIsLoading, 
  loadError, 
  setLoadError,
  isLoading // Ensure this is passed correctly
}) => {
  const [eventList, setEventList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [eventsLimit] = useState(10); // Default limit

  const logMessage = (message) => {
    console.log(`[HomeEventsList] ${message}`);
  };

  const memoizedGetDistance = useMemo(() => {
    return getDistanceFromLatLonInMiles;
  }, []);

  const loadEvents = useCallback(async (page = 0, params = {}, limit = 10) => {
    logMessage(`Loading events: page=${page}, params=${JSON.stringify(params)}, limit=${limit}`);

    if (!userLocation) {
      logMessage('User location is not defined.');
      return;
    }

    setIsLoading(true);
    setLoadError('');

    try {
      const lat = userLocation.lat || 40.730610;
      const lng = userLocation.lng || -73.935242;
      const newEvents = await fetchEvents({ ...params, lat, lng, page, limit });

      logMessage(`Fetched ${newEvents.length} events from API`);

      const eventsWithDistance = newEvents.map(event => ({
        ...event,
        distance: memoizedGetDistance(lat, lng, event.location.coordinates[1], event.location.coordinates[0])
      }));

      eventsWithDistance.sort((a, b) => a.distance - b.distance);

      setEventList((prevEvents) => (page === 0 ? eventsWithDistance : [...prevEvents, ...eventsWithDistance]));
      setCurrentPage(page + 1);
    } catch (error) {
      logMessage(`Error loading events: ${error.message}`);
      if (error.response && error.response.status === 404) {
        setLoadError('No events found for the specified location.');
      } else {
        setLoadError('Failed to load events. Please try again later.');
      }
    } finally {
      setIsLoading(false);
      logMessage('Finished loading events');
    }
  }, [userLocation, setIsLoading, setLoadError, memoizedGetDistance]);

  useEffect(() => {
    if (userLocation) {
      setEventList([]);
      setCurrentPage(0);
      loadEvents(0, {}, eventsLimit);
    }
  }, [userLocation, loadEvents, eventsLimit]);

  const handleEventSelect = (event) => {
    logMessage(`Event selected: ${event.title}`);
    onEventClick(event);
  };

  const handleLoadMore = () => {
    logMessage(`Loading more events for page ${currentPage}`);
    loadEvents(currentPage, {}, eventsLimit);
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
            <p>Distance: {event.distance.toFixed(2)} miles</p>
            <button onClick={() => console.log(`RSVP to event ${event._id}`)}>RSVP</button>
          </div>
        ))}
      </div>
      {isLoading && <p>Loading...</p>}
      {loadError && <p>{loadError}</p>}
      {eventList.length === 0 && !isLoading && !loadError && <p>No events available</p>}
      <button onClick={handleLoadMore} disabled={isLoading}>Load More</button>
      <p>Showing {eventList.length} events</p>
    </div>
  );
};

export default HomeEventsList;
