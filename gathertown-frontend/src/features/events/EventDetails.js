import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEventDetails } from '../../api/eventsService';
import { fetchAddress } from '../../utils/geolocationUtils';

const EventDetails = () => {
  const { eventId } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState('Unknown Address');

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        console.log(`Fetching details for event ID: ${eventId}`);
        const details = await getEventDetails(eventId);
        setEventDetails(details);
        setLoading(false);
        if (details.location.coordinates) {
          const [lng, lat] = details.location.coordinates;
          const fetchedAddress = await fetchAddress(lat, lng);
          setAddress(fetchedAddress);
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return <p>Loading event details...</p>;
  }

  if (error) {
    return <p>Error loading event details: {error.message}</p>;
  }

  if (!eventDetails) {
    return <p>No event details available</p>;
  }

  return (
    <div>
      {eventDetails.images && eventDetails.images.length > 0 && (
        <img
          src={eventDetails.images[0]}
          alt={eventDetails.title}
          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
        />
      )}
      <h2>{eventDetails.title}</h2>
      <p>{eventDetails.description}</p>
      <p>Date: {new Date(eventDetails.date).toLocaleDateString()} at {eventDetails.time}</p>
      <p>Location: {address}</p>
    </div>
  );
};

export default EventDetails;

