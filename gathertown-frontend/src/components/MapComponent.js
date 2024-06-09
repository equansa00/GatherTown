// src/components/MapComponent.js
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXF1YW5zYTAwIiwiYSI6ImNsd3BvMDZubjJzM24yanBwbDV6cmMzM2cifQ.D4NmR6jJ_G_qbDp22fl4gw';
mapboxgl.accessToken = MAPBOX_TOKEN;

const MapComponent = ({ center = [0, 0], zoom = 12, events = [], selectedEvent }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

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

    map.current.on('load', () => {
      console.log('Map loaded successfully');
    });

    map.current.on('error', (error) => {
      console.error('Mapbox GL JS error:', error.message);
    });
  }, [center, zoom]);

  useEffect(() => {
    if (!map.current || !Array.isArray(events)) return;

    events.forEach(event => {
      if (event.location.coordinates && event.location.coordinates.length === 2) {
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
      map.current.flyTo({
        center: selectedEvent.location.coordinates,
        zoom: 15
      });
    }
  }, [selectedEvent]);

  return <div ref={mapContainer} style={{ width: '100%', height: '1000px' }} />;
};

export default MapComponent;
