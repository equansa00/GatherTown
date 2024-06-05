import React, { useState, useEffect } from 'react';
import { fetchEventsNearby } from '../../api/eventsService';
import { getDistanceFromLatLonInMiles } from '../../utils/geolocationUtils';
import { initializeRsvpStatus, handleRsvp } from '../../utils/rsvpUtils';

const EventsNearby = ({ userLocation, onEventClick, onEventHover }) => {
  const [nearbyEventList, setNearbyEventList] = useState([]);
  const [rsvpStatus, setRsvpStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const nearbyEvents = await fetchEventsNearby({
          lat: userLocation.lat,
          lng: userLocation.lng,
          maxDistance: 8046.72,
          limit: 50
        });

        const eventsWithDistance = nearbyEvents.map(event => ({
          ...event,
          distance: getDistanceFromLatLonInMiles(userLocation.lat, userLocation.lng, event.location.coordinates[1], event.location.coordinates[0])
        }));

        setNearbyEventList(eventsWithDistance);
        setRsvpStatus(initializeRsvpStatus(eventsWithDistance));
      } catch (error) {
        setLoadError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [userLocation]);

  const handleRSVPClick = async (eventId, e) => {
    e.stopPropagation();
    await handleRsvp(eventId, rsvpStatus, setRsvpStatus, console.error);
  };

  const handleEventSelect = (event) => {
    onEventClick(event);
  };

  return (
    <div className="events-list-container">
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
          <button onClick={(e) => handleRSVPClick(event._id, e)}>
            {rsvpStatus.find(status => status.id === event._id)?.isRSVPed ? '✔️ RSVPed' : 'RSVP'}
          </button>
        </div>
      ))}
      {isLoading && <p>Loading...</p>}
      {loadError && <p>{loadError}</p>}
    </div>
  );
};

export default EventsNearby;
