import React, { useState, useEffect, useCallback } from 'react';
import { fetchEvents, rsvpToEvent } from '../../api/eventsService';
import { fetchAddress } from '../../utils/geolocationUtils';

const EventsList = ({ onEventClick, onLoadMore }) => {
  const [eventList, setEventList] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchInitialEvents = useCallback(async () => {
    try {
      const initialEvents = await fetchEvents(40.712776, -74.005974, 10000); // Example: New York coordinates
      const eventsWithAddresses = await Promise.all(initialEvents.map(async event => {
        if (event.location && event.location.coordinates) {
          const [lng, lat] = event.location.coordinates;
          const address = await fetchAddress(lat, lng);
          return { ...event, address };
        }
        return { ...event, address: 'Unknown Address' };
      }));
      console.log('Fetched events with addresses:', eventsWithAddresses);
      setEventList(eventsWithAddresses);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  }, []);

  useEffect(() => {
    fetchInitialEvents();
  }, [fetchInitialEvents]);

  const handleEventSelect = (event) => {
    setSelectedEvent(selectedEvent === event ? null : event);
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleRSVP = async (eventId) => {
    try {
      await rsvpToEvent(eventId);
      alert('RSVP successful!');
    } catch (error) {
      alert('Failed to RSVP');
      console.error('RSVP error:', error);
    }
  };

  return (
    <div className="event-list">
      {eventList.map(event => (
        <div
          key={event._id}
          className="event-item"
          onClick={() => handleEventSelect(event)}
        >
          <h3>{event.title}</h3>
          <p>{new Date(event.date).toLocaleString()}</p>
          <p>{event.address}</p>
          <button onClick={(e) => {
            e.stopPropagation();
            handleRSVP(event._id);
          }}>RSVP</button>
        </div>
      ))}
      {onLoadMore && (
        <button onClick={onLoadMore} className="load-more">Load More</button>
      )}
      <p>Showing {eventList.length} events</p>
    </div>
  );
};

export default EventsList;
