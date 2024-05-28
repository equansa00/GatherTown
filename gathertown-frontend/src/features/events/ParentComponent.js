import React, { useState } from 'react';
import EventsList from './EventsList'; // Adjust the import path as necessary

const ParentComponent = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
    // Handle event click
  };

  const handleEventHover = (event) => {
    console.log('Event hovered:', event);
    // Handle event hover
  };

  return (
    <EventsList
      onEventClick={handleEventClick}
      onEventHover={handleEventHover}
      userLocation={userLocation}
      setPosition={setUserLocation}
      setEvents={setEvents}
      isLoading={isLoading}
      setIsLoading={setIsLoading}
      loadError={loadError}
      setLoadError={setLoadError}
    />
  );
};

export default ParentComponent;
