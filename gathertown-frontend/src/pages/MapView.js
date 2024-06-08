import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MapboxGL from 'mapbox-gl';
import { fetchEventById } from '../api/eventsService';

MapboxGL.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapView = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const getEvent = async () => {
      const eventData = await fetchEventById(eventId);
      setEvent(eventData);
    };

    getEvent();
  }, [eventId]);

  useEffect(() => {
    if (event) {
      const map = new MapboxGL.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: event.location.coordinates,
        zoom: 14,
      });

      new MapboxGL.Marker()
        .setLngLat(event.location.coordinates)
        .setPopup(new MapboxGL.Popup().setText(event.title))
        .addTo(map);
    }
  }, [event]);

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{event.title}</h1>
      <div id="map" style={{ width: '100%', height: '500px' }}></div>
    </div>
  );
};

export default MapView;
