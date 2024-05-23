import React, { useState, useEffect, useCallback } from 'react';
import EventListItem from './EventListItem';
import { fetchEvents, rsvpToEvent } from '../../api/eventsService';
import { fetchAddress } from '../../utils/geolocationUtils';

const EventsList = ({ onEventHover, onEventClick }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchInitialEvents = useCallback(async () => {
    try {
      console.log('Fetching initial events...');
      const initialEvents = await fetchEvents(40.712776, -74.005974, 10000); // Example: New York coordinates
      console.log('Initial events fetched:', initialEvents);
      const eventsWithAddresses = await Promise.all(initialEvents.map(async event => {
        if (event.location && event.location.coordinates) {
          const [lng, lat] = event.location.coordinates;
          const address = await fetchAddress(lat, lng);
          return { ...event, address };
        }
        return { ...event, address: 'Unknown Address' };
      }));
      console.log('Events with addresses:', eventsWithAddresses);
      setEvents(eventsWithAddresses);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  }, []);

  useEffect(() => {
    fetchInitialEvents();
  }, [fetchInitialEvents]);

  const handleEventSelect = (event) => {
    console.log('Event selected:', event);
    setSelectedEvent(selectedEvent === event ? null : event);
    if (onEventClick) {
      onEventClick(event);
    }
  };

  const handleEventHover = (event) => {
    if (onEventHover) {
      onEventHover(event);
    }
    console.log("Hovered over event:", event.title);
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
    <div>
      {events.map(event => (
        <EventListItem
          key={event._id}
          event={event}
          onHover={handleEventHover}
          onSelect={handleEventSelect}
          isSelected={selectedEvent === event}
          onRSVP={handleRSVP}
        />
      ))}
    </div>
  );
};

export default EventsList;
