import React, { useEffect, useState, useCallback } from 'react';
import RandomEventsList from './RandomEventsList';
import EventsNearby from './EventsNearby';
import { fetchEventsNearby, fetchRandomEvents } from '../../api/eventsService';
import { getDistanceFromLatLonInMiles } from '../../utils/geolocationUtils';
import { initializeRsvpStatus, handleRsvp } from '../../utils/rsvpUtils';

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
      const nearbyEvents = await fetchEventsNearby(
        userLocation.lat,
        userLocation.lng,
        8046.72, // 5 miles in meters
        50 // Assuming you want to load all nearby events
      );
      logMessage(`Fetched ${nearbyEvents.length} nearby events from API`);

      const eventsWithDistance = nearbyEvents.map(event => ({
        ...event,
        distance: getDistanceFromLatLonInMiles(userLocation.lat, userLocation.lng, event.location.coordinates[1], event.location.coordinates[0])
      }));

      setNearbyEventList(eventsWithDistance);
      setRsvpStatus(initializeRsvpStatus(eventsWithDistance));

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
        ...initializeRsvpStatus(randomEventsWithDistance)
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

  const handleRSVP = async (eventId, e) => {
    e.stopPropagation();

    const currentRsvpStatus = rsvpStatus.find(status => status.eventId === eventId);
    if (currentRsvpStatus?.isRSVPed) {
      alert('You have already RSVPed to this event.');
      return;
    }
    
    try {
      await handleRsvp(eventId, rsvpStatus, setRsvpStatus, console.error);
    } catch (error) {
      console.error('RSVP error:', error);
    }
  };

  return (
    <div className="events-list-container">
      <EventsNearby
        events={nearbyEventList}
        onEventClick={handleEventSelect}
        onEventHover={onEventHover}
        rsvpStatus={rsvpStatus}
        setRsvpStatus={setRsvpStatus}
        handleRSVP={handleRSVP}
      />
      <RandomEventsList
        events={randomEventList}
        onEventClick={handleEventSelect}
        onEventHover={onEventHover}
        rsvpStatus={rsvpStatus}
        setRsvpStatus={setRsvpStatus}
        handleRSVP={handleRSVP}
      />
      {isLoading && <p>Loading...</p>}
      {loadError && <p>{loadError}</p>}
    </div>
  );
};

export default HomeEventsList;

