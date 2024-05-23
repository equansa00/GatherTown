import React, { useState, useEffect, useCallback } from 'react';
import MapComponent from '../components/MapComponent';
import EventsList from '../features/events/EventsList';
import EventDetails from '../features/events/EventDetails';
import { fetchEvents } from '../api/eventsService';
import { getLocation } from '../components/LocationService';
import './HomePage.css';

function HomePage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [position, setPosition] = useState({ lat: 0, lng: 0 });
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEventsData = useCallback(async (latitude, longitude) => {
    try {
      console.log(`HomePage: Fetching events for position: (${latitude}, ${longitude})`);
      const eventsData = await fetchEvents(latitude, longitude, 100000);
      console.log('HomePage: Events fetched:', eventsData);
      setEvents(eventsData);
      setIsLoading(false);
    } catch (error) {
      console.error('HomePage: Error fetching events:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("HomePage: useEffect triggered - Requesting geolocation...");
    getLocation(
      position => {
        console.log(`HomePage: Geolocation success - Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`);
        setPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        fetchEventsData(position.coords.latitude, position.coords.longitude);
      },
      error => {
        console.error("HomePage: Geolocation error:", error);
        setIsLoading(false);
      }
    );
  }, [fetchEventsData]);

  const handleEventClick = (event) => {
    console.log('HomePage: Event clicked:', event);
    setSelectedEvent(event);
  };

  if (isLoading) {
    console.log('HomePage: Loading data...');
    return <p>Loading events...</p>;
  }

  console.log('HomePage: Rendering with events and map...');
  return (
    <div className="container">
      <div className="map">
        <MapComponent
          center={position}
          events={events}
        />
      </div>
      <div className="event-list">
        <EventsList 
          events={events}
          onEventClick={handleEventClick}
        />
      </div>
      <div className="event-details">
        {selectedEvent ? (
          <EventDetails event={selectedEvent} />
        ) : (
          <p>Select an event to see the details</p>
        )}
      </div>
    </div>
  );
}

export default HomePage;
