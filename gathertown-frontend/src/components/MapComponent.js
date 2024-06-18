// src/components/MapComponent.js
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXF1YW5zYTAwIiwiYSI6ImNsd3BvMDZubjJzM24yanBwbDV6cmMzM2cifQ.D4NmR6jJ_G_qbDp22fl4gw';
mapboxgl.accessToken = MAPBOX_TOKEN;

const MapComponent = ({ center = [0, 0], zoom = 12, events = [], selectedEvent }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const directions = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [customOrigin, setCustomOrigin] = useState('');

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    console.log('Initializing map with center:', center, 'and zoom:', zoom);

    if (!Array.isArray(center) || center.length !== 2 || center.some(isNaN)) {
      console.error('Invalid map center coordinates:', center);
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center,
      zoom: zoom,
    });

    directions.current = new MapboxDirections({
      accessToken: MAPBOX_TOKEN,
      unit: 'metric',
      profile: 'mapbox/driving',
    });

    map.current.addControl(directions.current, 'top-left');

    map.current.on('load', () => {
      console.log('Map loaded successfully');
    });

    map.current.on('error', (error) => {
      console.error('Mapbox GL JS error:', error.message);
    });
  }, [center, zoom]);

  useEffect(() => {
    if (!map.current || !Array.isArray(events)) {
      console.error('Map not initialized or invalid events array:', events);
      return;
    }

    console.log('Adding events to map:', events);

    events.forEach(event => {
      if (event.location.coordinates && event.location.coordinates.length === 2) {
        console.log('Adding marker for event:', event.title, 'at coordinates:', event.location.coordinates);
        new mapboxgl.Marker()
          .setLngLat(event.location.coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(event.title))
          .addTo(map.current);
      } else {
        console.error('Invalid event coordinates:', event.location.coordinates);
      }
    });
  }, [events]);

  useEffect(() => {
    if (selectedEvent && map.current) {
      console.log('Flying to selected event:', selectedEvent.title, 'at coordinates:', selectedEvent.location.coordinates);
      map.current.flyTo({
        center: selectedEvent.location.coordinates,
        zoom: 15
      });

      // Add route to selected event from user's location
      if (directions.current && (userLocation || customOrigin)) {
        const origin = customOrigin || userLocation;
        if (typeof origin === 'string') {
          directions.current.setOrigin(origin);
        } else {
          directions.current.setOrigin(origin);
        }
        directions.current.setDestination(selectedEvent.location.coordinates);
      }
    }
  }, [selectedEvent, userLocation, customOrigin]);

  const handleCustomOriginChange = (event) => {
    setCustomOrigin(event.target.value);
  };

  const handleSetCustomOrigin = () => {
    if (directions.current && customOrigin) {
      directions.current.setOrigin(customOrigin);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '90vh' }} />
      <div style={{ padding: '10px' }}>
        <input
          type="text"
          value={customOrigin}
          onChange={handleCustomOriginChange}
          placeholder="Enter custom origin"
          style={{ width: '80%' }}
        />
        <button onClick={handleSetCustomOrigin} style={{ width: '20%' }}>Set Origin</button>
      </div>
    </div>
  );
};

export default MapComponent;
