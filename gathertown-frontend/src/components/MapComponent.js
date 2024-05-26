import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
};

function MapComponent({ center, events, selectedEvent, onMarkerClick, onLoad }) {
  const [activeMarker, setActiveMarker] = useState(null);
  const mapRef = useRef(null);

  const handleMarkerClickInternal = (event) => {
    console.log('Marker clicked:', event); // Log click
    setActiveMarker(event);
    onMarkerClick(event);

    if (mapRef.current && isValidCoordinates(event.location.coordinates)) {
      const { lat, lng } = convertArrayToLatLng(event.location.coordinates);
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(15);
    } else {
      console.error('Invalid coordinates or map ref not ready for panTo:', event.location.coordinates);
    }
  };

  const handleMarkerMouseOver = (event) => {
    console.log('Marker hovered:', event); // Log hover
  };

  useEffect(() => {
    if (selectedEvent && mapRef.current && isValidCoordinates(selectedEvent.location.coordinates)) {
      const { lat, lng } = convertArrayToLatLng(selectedEvent.location.coordinates);
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(15);
    } else if (selectedEvent) {
      console.error('Invalid coordinates or map ref not ready for panTo:', selectedEvent.location.coordinates);
    }
  }, [selectedEvent]);

  // Helper function to validate coordinates
  const isValidCoordinates = (coordinates) => {
    return coordinates && Array.isArray(coordinates) && coordinates.length === 2 && !isNaN(coordinates[0]) && !isNaN(coordinates[1]);
  };

  // Helper function to convert array to {lat, lng} object
  const convertArrayToLatLng = (coordinates) => {
    return {
      lat: coordinates[1],
      lng: coordinates[0],
    };
  };

  return (
    <GoogleMap
      onLoad={(mapInstance) => {
        mapRef.current = mapInstance;
        if (onLoad) onLoad(mapInstance);
      }}
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
    >
      {events.map((event) => {
        if (!isValidCoordinates(event.location.coordinates)) {
          console.error('Invalid coordinates for event:', event);
          return null;
        }

        const { lat, lng } = convertArrayToLatLng(event.location.coordinates);
        console.log('Marking event on map:', event); // Log event being marked

        return (
          <Marker
            key={event._id}
            position={{ lat, lng }}
            onClick={() => handleMarkerClickInternal(event)}
            onMouseOver={() => handleMarkerMouseOver(event)}
            icon={{
              url: `http://maps.google.com/mapfiles/ms/icons/red-dot.png`,
            }}
          >
            {activeMarker === event && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)} position={{ lat, lng }}>
                <div>
                  <h4>{event.title}</h4>
                  <p>{event.description}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        );
      })}
    </GoogleMap>
  );
}

export default MapComponent;





