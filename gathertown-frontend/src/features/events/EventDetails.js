import React, { useEffect, useState } from 'react';
import { getEventDetails } from '../../api/eventsService';
import { fetchAddress } from '../../utils/geolocationUtils';

function EventDetails({ event }) {
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState('Unknown Address');

  useEffect(() => {
    if (!event) {
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        console.log(`Fetching details for event ID: ${event._id}`);
        const details = await getEventDetails(event._id);
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
  }, [event]);

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
      <h2>{eventDetails.title}</h2>
      <p>{eventDetails.description}</p>
      <p>Date: {new Date(eventDetails.date).toLocaleDateString()} at {eventDetails.time}</p>
      <p>Location: {address}</p>
    </div>
  );
}

export default EventDetails;
