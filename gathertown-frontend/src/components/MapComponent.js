import React, { useEffect, useRef, useState } from 'react';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import { fetchEventsBasedOnLocation } from '../services/eventService'; // Corrected and clarified import statement

const containerStyle = {
  width: '100%',
  height: '400px'
};

const libraries = ['places', 'marker']; // Include all necessary libraries if needed

function MapComponent({ center }) {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
    id: 'google-map-script'
  });

  const [events, setEvents] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        fetchEventsBasedOnLocation(latitude, longitude).then(events => setEvents(events));
      },
      error => {
        console.error("Error getting location:", error);
      }
    );
  }, [fetchEventsBasedOnLocation]); // Ensure fetch function is stable and included in dependency array if it uses props/state

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onLoad={map => mapRef.current = map}
    >
      {events.map(event => (
        <Marker
          key={event._id}
          position={{ lat: event.location.coordinates[1], lng: event.location.coordinates[0] }}
          onClick={() => console.log('Marker clicked!')}
        />
      ))}
    </GoogleMap>
  );
}

export default MapComponent;
