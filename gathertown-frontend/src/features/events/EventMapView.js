// src/features/events/EventMapView.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchEventById } from '../../api/eventsService';
import MapComponent from '../../components/MapComponent';

const EventMapView = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log(`Fetching event with ID: ${eventId}`);

    const getEvent = async () => {
      try {
        const fetchedEvent = await fetchEventById(eventId);
        console.log('Fetched event:', fetchedEvent);
        setEvent(fetchedEvent);
      } catch (err) {
        setError('Failed to load event');
        console.error('Error fetching event:', err);
      }
    };

    getEvent();
  }, [eventId]);

  if (error) {
    console.error('Rendering error message:', error);
    return <div>{error}</div>;
  }

  if (!event) {
    console.log('Event data is still loading...');
    return <div>Loading...</div>;
  }

  console.log('Rendering event on map:', event);
  return (
    <div>
      <h1>{event.title}</h1>
      <MapComponent center={[event.location.coordinates[1], event.location.coordinates[0]]} zoom={15} events={[event]} />
    </div>
  );
};

export default EventMapView;
