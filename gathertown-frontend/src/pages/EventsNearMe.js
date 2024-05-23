import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import MapComponent from '../components/MapComponent';
import { fetchEvents } from '../api/eventsService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { useAuth } from '../context/AuthContext';

const defaultPosition = { lat: 40.730610, lng: -73.935242 }; // Default to New York City

function EventsNearMe({ googleMapsApiKey }) {
  const [events, setEvents] = useState([]);
  const [center, setCenter] = useState(defaultPosition);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchLocationAndEvents = async () => {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        setError("Geolocation is not supported by this browser.");
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          fetchEventsBasedOnLocation(position.coords.latitude, position.coords.longitude);
        },
        error => {
          console.error("Geolocation error:", error);
          setError("Error getting location. Please enable location services or enter a valid address.");
          setIsLoading(false);
        },
        { enableHighAccuracy: true }
      );
    };

    fetchLocationAndEvents();
  }, []);

  const fetchEventsBasedOnLocation = useCallback(async (latitude, longitude) => {
    try {
      const data = await fetchEvents(latitude, longitude, 10000);
      setEvents(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: search,
          key: googleMapsApiKey
        }
      });
      if (response.data.results.length === 0) {
        throw new Error('No results found for the provided address.');
      }
      const newLocation = response.data.results[0].geometry.location;
      setCenter(newLocation);
      fetchEventsBasedOnLocation(newLocation.lat, newLocation.lng);
      setSearch('');
    } catch (error) {
      console.error('Failed to fetch location:', error);
      setError('Invalid address. Please enter a valid address.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Events Near Me</h2>
      {user && <p>Welcome, {user.username}!</p>}

      <form onSubmit={handleSearchSubmit}>
        <input 
          type="text" 
          value={search} 
          onChange={handleSearchChange} 
          placeholder="Enter address or city" 
        />
        <button type="submit">Search</button>
      </form>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : (
        <>
          <MapComponent apiKey={googleMapsApiKey} center={center} events={events} />
          <h3>Events Near You:</h3>
          <ul>
            {events.length > 0 ? (
              events.map(event => <li key={event._id}>{event.title}</li>)
            ) : (
              <li>No events found near your location.</li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}

export default EventsNearMe;

