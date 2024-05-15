import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEventDetails } from '../../api/eventsService';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await getEventDetails(id);
        setEvent(response);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event details:', error);
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) return <div>Loading event details...</div>;

  return (
    <div>
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <p>{event.date}</p>
      <p>{event.location}</p>
      <p>{event.category}</p>
    </div>
  );
};

export default EventDetails;

