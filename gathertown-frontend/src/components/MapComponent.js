import React, { useEffect, useRef, useState } from 'react';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import { fetchEvents } from '../api/eventsService';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const libraries = ['places', 'marker'];

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
    console.log("MapComponent: Component mounted. Loading maps...");
    if (!navigator.geolocation) {
      console.error("MapComponent: Geolocation is not supported by this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async position => {
        console.log("MapComponent: Geolocation success, fetching events...");
        try {
          const fetchedEvents = await fetchEvents(position.coords.latitude, position.coords.longitude, 100000);
          console.log("MapComponent: Events fetched successfully", fetchedEvents);
          setEvents(fetchedEvents);
        } catch (error) {
          console.error("MapComponent: Error fetching events", error);
        }
      },
      error => {
        console.error("MapComponent: Error getting location", error);
      }
    );
  }, []);

  const handleMarkerClick = (event) => {
    console.log('Marker clicked!', event.title);
    if (mapRef.current) {
      mapRef.current.panTo({ lat: event.location.coordinates[1], lng: event.location.coordinates[0] });
      mapRef.current.setZoom(15);
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps</div>;

  console.log("MapComponent: Maps loaded, rendering...");
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      onLoad={map => {
        console.log("MapComponent: GoogleMap loaded.");
        mapRef.current = map;
      }}
    >
      {Array.isArray(events) && events.map(event => (
        <Marker
          key={event._id}
          position={{ lat: event.location.coordinates[1], lng: event.location.coordinates[0] }}
          onClick={() => handleMarkerClick(event)}
        />
      ))}
    </GoogleMap>
  );
}

export default MapComponent;

