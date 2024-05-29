import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapComponent = ({ center, events, selectedEvent, onMarkerClick, onLoad, onEventHover, useStaticMap = false }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markers = useRef([]);

  useEffect(() => {
    if (useStaticMap) return;

    console.log('MapComponent mounted');

    if (mapContainerRef.current && !mapRef.current) {
      console.log('Map container ref is available');
      const mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [center.lng, center.lat],
        zoom: 12,
      });

      mapInstance.on('load', () => {
        console.log('Map loaded');
        mapRef.current = mapInstance;
        setMapLoaded(true);
        if (onLoad) onLoad(mapInstance);
      });

      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

      return () => {
        console.log('Map will be removed');
        mapInstance.remove();
        console.log('Map removed');
      };
    }
  }, [center, onLoad, useStaticMap]);

  useEffect(() => {
    if (mapRef.current && mapLoaded && selectedEvent) {
      const [lng, lat] = selectedEvent.location.coordinates;
      console.log(`Selected event coordinates: ${lng}, ${lat}`);
      mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
    }
  }, [mapLoaded, selectedEvent]);

  useEffect(() => {
    if (mapRef.current && mapLoaded && events.length > 0) {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      events.forEach((event) => {
        const [lng, lat] = event.location.coordinates;
        // console.log(`Adding marker at coordinates: ${lng}, ${lat}`);

        try {
          const marker = new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .addTo(mapRef.current);

          const markerElement = marker.getElement();
          if (markerElement) {
            markerElement.addEventListener('click', () => handleMarkerClick(event), { passive: true });
            markerElement.addEventListener('mouseenter', () => handleMarkerMouseOver(event), { passive: true });
          } else {
            console.warn('Marker element is undefined');
          }

          markers.current.push(marker);
        } catch (error) {
          console.error('Error adding marker:', error);
        }
      });
    }
  }, [mapLoaded, events]);

  const handleMarkerClick = (event) => {
    const [lng, lat] = event.location.coordinates;
    console.log(`Marker clicked: ${lng}, ${lat}`);
    mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
    if (onMarkerClick) onMarkerClick(event);
  };

  const handleMarkerMouseOver = (event) => {
    console.log(`Marker hovered: ${event.title}`);
    if (onEventHover) onEventHover(event);
  };

  if (useStaticMap) {
    const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${center.lng},${center.lat},12,0/600x300?access_token=${mapboxgl.accessToken}`;
    return <img src={staticMapUrl} alt="Static map" style={{ width: '100%', height: '400px' }} />;
  }

  return (
    <div className="map-container" ref={mapContainerRef} style={{ height: '500px', width: '100%' }}>
      {mapLoaded ? null : <div>Loading map...</div>}
    </div>
  );
};

export default MapComponent;
