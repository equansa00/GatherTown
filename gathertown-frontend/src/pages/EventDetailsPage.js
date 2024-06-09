// src/pages/EventDetailsPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EventDetails from '../features/events/EventDetails';
import { fetchEventById } from '../api/eventsService';

const EventDetailsPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await fetchEventById(id);
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event:', error);
      }
    };
    fetchEvent();
  }, [id]);

  if (!event) {
    return <div>Loading...</div>;
  }

  return <EventDetails event={event} />;
};

export default EventDetailsPage;
