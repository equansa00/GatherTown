import React, { useState, useEffect, useCallback } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import MapComponent from '../components/MapComponent';
import EventsList from '../features/events/EventsList';
import EventDetails from '../features/events/EventDetails';
import { fetchEvents, fetchEventsByZip } from '../api/eventsService';
import { getLocation, showError } from '../components/LocationService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './HomePage.css';
import { fetchAddress } from '../utils/geolocationUtils';  // Add this line to import fetchAddress

const defaultPosition = { lat: 40.730610, lng: -73.935242 };
const libraries = ['places', 'marker'];

function HomePage({ googleMapsApiKey }) {
  const [events, setEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [position, setPosition] = useState(defaultPosition);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const { user } = useAuth();

  const loaderOptions = {
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey,
    libraries,
  };

  const { isLoaded } = useJsApiLoader(loaderOptions);

  const fetchEventsData = useCallback(async (latitude, longitude, distance = 10000) => {
    try {
      const allEvents = await fetchEvents(latitude, longitude, distance);
      const formattedEvents = allEvents.map((event) => {
        if (event.location && event.location.coordinates && Array.isArray(event.location.coordinates)) {
          const [lng, lat] = event.location.coordinates; // Note the order: lng, then lat
  
          return {
            ...event,
            address: event.address || 'Unknown Address', // Keep existing address or set to 'Unknown'
            location: {
              ...event.location,
              coordinates: { lat, lng }, // Correct object format
            },
          };
        } else {
          return {
            ...event,
            address: 'Unknown Address', // Handle cases where coordinates are missing or invalid
            location: { coordinates: { lat: defaultPosition.lat, lng: defaultPosition.lng } },
          };
        }
      });
  
      setEvents(formattedEvents);
      setDisplayedEvents(formattedEvents.slice(0, 50));
      console.log('Formatted events fetched:', formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      if (distance < 1000000) {
        fetchEventsData(latitude, longitude, distance * 10);
      } else {
        showError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getLocation(
      (position) => {
        setPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        fetchEventsData(position.coords.latitude, position.coords.longitude);
      },
      showError
    );
  }, [fetchEventsData]);

  const handleEventClick = (event) => {
    setSelectedEvent(event); // Set the selected event to trigger the zoom in MapComponent
  };

  const handleGeolocation = () => {
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        fetchEventsData(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setLoadError('Error fetching location');
        setIsLoading(false);
      }
    );
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: searchQuery,
          key: googleMapsApiKey,
        },
      });
      if (response.data.results.length === 0) {
        throw new Error('No results found for the provided address.');
      }
      const newLocation = response.data.results[0].geometry.location;
      setPosition(newLocation);
      await fetchEventsByZipCode(searchQuery);
      setSearchQuery('');
    } catch {
      console.error('Failed to fetch location');
      setLoadError('Invalid address. Please enter a valid address.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventsByZipCode = useCallback(async (zipCode) => {
    try {
      const eventsByZip = await fetchEventsByZip(zipCode);
      const eventsWithAddresses = await Promise.all(eventsByZip.map(async (event) => {
        if (event.location && event.location.coordinates) {
          const [lng, lat] = event.location.coordinates;
          const address = await fetchAddress(lat, lng);
          return { ...event, address };
        }
        return { ...event, address: 'Unknown Address' };
      }));
      setEvents(eventsWithAddresses);
      setDisplayedEvents(eventsWithAddresses.slice(0, 50));
      console.log('Events fetched by zip code:', eventsWithAddresses);
    } catch (error) {
      console.error('Error fetching events by zip code:', error);
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMoreEvents = () => {
    const nextPage = page + 1;
    const startIndex = nextPage * 50;
    const endIndex = startIndex + 50;
    setDisplayedEvents(events.slice(0, endIndex));
    setPage(nextPage);
    console.log(`Loaded more events: Page ${nextPage}`);
  };

  const handleMarkerClick = useCallback(
    (event) => {
      setSelectedEvent(event);
      console.log('Marker clicked:', event);
    },
    []
  );

  const handleMapLoad = useCallback((mapInstance) => {
    console.log("Map loaded", mapInstance);
  }, []);

  return (
    <div className="outer-container">
      <div className="header">
        {user && <p>Welcome, {user.username}!</p>}
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by Zip Code or City, State"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <button onClick={handleGeolocation}>Use My Location</button>
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : loadError ? (
        <ErrorDisplay message="Error loading map." />
      ) : (
        <div className="main-content">
          <div className="map-container">
            {isLoaded && (
              <MapComponent
                center={position}
                events={events}
                selectedEvent={selectedEvent}
                onMarkerClick={handleMarkerClick}
                onLoad={handleMapLoad}
              />
            )}
            {!isLoaded && <div>Loading map...</div>}
          </div>
          <div className="events-section">
            <EventsList
              events={displayedEvents}
              onEventClick={handleEventClick}
              onLoadMore={displayedEvents.length < events.length ? loadMoreEvents : null}
            />
            <p>Showing {displayedEvents.length} out of {events.length} events</p>
            <p>Showing events based on {searchQuery ? `search query: ${searchQuery}` : 'user location'}</p>
          </div>
          <div className="event-details">
            {selectedEvent ? <EventDetails event={selectedEvent} /> : <p>Select an event to see the details</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
