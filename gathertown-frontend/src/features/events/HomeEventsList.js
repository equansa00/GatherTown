import React, { useEffect, useState, useCallback } from 'react';
import { fetchEventsNearby, fetchRandomEvents, rsvpToEvent } from '../../api/eventsService';
import { getDistanceFromLatLonInMiles } from '../../utils/geolocationUtils';

const HomeEventsList = ({
  onEventClick,
  onEventHover = () => {},
  setIsLoading,
  loadError,
  setLoadError,
  isLoading,
  userLocation
}) => {
  const [nearbyEventList, setNearbyEventList] = useState([]);
  const [randomEventList, setRandomEventList] = useState([]);
  const [rsvpStatus, setRsvpStatus] = useState([]);

  const logMessage = (message) => {
    console.log(`[HomeEventsList] ${message}`);
  };

  const loadEvents = useCallback(async () => {
    logMessage('Loading events');

    setIsLoading(true);
    setLoadError('');

    try {
      // Fetch Nearby Events
      const nearbyEvents = await fetchEventsNearby({
        lat: userLocation.lat,
        lng: userLocation.lng,
        maxDistance: 8046.72, // 5 miles in meters
        limit: 50 // Assuming you want to load all nearby events
      });
      logMessage(`Fetched ${nearbyEvents.length} nearby events from API`);

      const eventsWithDistance = nearbyEvents.map(event => ({
        ...event,
        distance: getDistanceFromLatLonInMiles(userLocation.lat, userLocation.lng, event.location.coordinates[1], event.location.coordinates[0])
      }));

      setNearbyEventList(eventsWithDistance);
      setRsvpStatus(eventsWithDistance.map(event => ({ id: event._id, isRSVPed: event.isRSVPed })));

      // Fetch Random Events
      const randomEvents = await fetchRandomEvents();
      logMessage(`Fetched ${randomEvents.length} random events from API`);

      const randomEventsWithDistance = randomEvents.map(event => ({
        ...event,
        distance: getDistanceFromLatLonInMiles(userLocation.lat, userLocation.lng, event.location.coordinates[1], event.location.coordinates[0])
      }));

      setRandomEventList(randomEventsWithDistance);
      setRsvpStatus(prevRsvpStatus => [
        ...prevRsvpStatus,
        ...randomEventsWithDistance.map(event => ({ id: event._id, isRSVPed: event.isRSVPed }))
      ]);
    } catch (error) {
      logMessage(`Error loading events: ${error.message}`);
      setLoadError('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
      logMessage('Finished loading events');
    }
  }, [setIsLoading, setLoadError, userLocation]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleEventSelect = (event) => {
    logMessage(`Event selected: ${event.title}`);
    onEventClick(event);
  };

  const handleRSVP = async (eventId, isRSVPed, e) => {
    e.stopPropagation();
    if (isRSVPed) {
      alert('You have already RSVPed to this event.');
      return;
    }
    try {
      await rsvpToEvent(eventId);
      alert('RSVP successful!');
      setRsvpStatus(rsvpStatus.map(status => (status.id === eventId ? { ...status, isRSVPed: true } : status)));
    } catch (error) {
      alert('Failed to RSVP');
      console.error('RSVP error:', error);
    }
  };

  return (
    <div className="events-list-container">
      <div className="nearby-events">
        <h2>Nearby Events</h2>
        {nearbyEventList.length === 0 && !isLoading && <p>No nearby events found</p>}
        {nearbyEventList.map((event) => (
          <div
            key={event._id}
            className="event-item"
            onClick={() => handleEventSelect(event)}
            onMouseEnter={() => onEventHover(event)}
          >
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>{new Date(event.date).toLocaleString()}</p>
            <p>{event.location.streetAddress}, {event.location.city}, {event.location.state}, {event.location.country}, {event.location.zipCode}</p>
            <p>Distance: {event.distance ? `${event.distance.toFixed(2)} miles` : 'N/A'}</p>
            <button onClick={(e) => handleRSVP(event._id, event.isRSVPed || rsvpStatus.find(status => status.id === event._id).isRSVPed, e)}>
              {event.isRSVPed || rsvpStatus.find(status => status.id === event._id).isRSVPed ? '✔️ RSVPed' : 'RSVP'}
            </button>
          </div>
        ))}
      </div>
      <div className="random-events">
        <h2>Random Events</h2>
        {randomEventList.length === 0 && !isLoading && <p>No random events found</p>}
        {randomEventList.map((event) => (
          <div
            key={event._id}
            className="event-item"
            onClick={() => handleEventSelect(event)}
            onMouseEnter={() => onEventHover(event)}
          >
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>{new Date(event.date).toLocaleString()}</p>
            <p>{event.location.streetAddress}, {event.location.city}, {event.location.state}, {event.location.country}, {event.location.zipCode}</p>
            <p>Distance: {event.distance ? `${event.distance.toFixed(2)} miles` : 'N/A'}</p>
            <button onClick={(e) => handleRSVP(event._id, event.isRSVPed || rsvpStatus.find(status => status.id === event._id).isRSVPed, e)}>
              {event.isRSVPed || rsvpStatus.find(status => status.id === event._id).isRSVPed ? '✔️ RSVPed' : 'RSVP'}
            </button>
          </div>
        ))}
      </div>
      {isLoading && <p>Loading...</p>}
      {loadError && <p>{loadError}</p>}
    </div>
  );
};

export default HomeEventsList;



















