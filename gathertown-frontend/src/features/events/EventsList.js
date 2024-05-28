// src/features/events/EventsList.js
import React from 'react';
import { rsvpToEvent } from '../../api/eventsService'; // Ensure this import is correct
import './EventsList.css';

const EventsList = ({ events, onEventClick, onEventHover }) => {
  const handleEventSelect = (event) => {
    if (onEventClick) onEventClick(event);
    console.log('Event selected:', event);
  };

  const handleRSVP = async (eventId, e) => {
    e.stopPropagation();
    try {
      await rsvpToEvent(eventId);
      alert('RSVP successful!');
      console.log(`RSVP successful for event ID: ${eventId}`);
    } catch (error) {
      alert('Failed to RSVP');
      console.error('RSVP error:', error);
    }
  };

  if (!events || events.length === 0) {
    return <p>No events available.</p>;
  }

  return (
    <div className="event-list">
      {events.map((event, index) => (
        <div
          key={event._id ? `${event._id}-${index}` : index}
          className="event-item"
          onClick={() => handleEventSelect(event)}
          onMouseEnter={() => onEventHover(event)}
        >
          <h3>{event.title}</h3>
          <p>{new Date(event.date).toLocaleString()}</p>
          <p>{event.location.address}</p>
          <button onClick={(e) => handleRSVP(event._id, e)}>RSVP</button>
        </div>
      ))}
    </div>
  );
};

export default EventsList;









// import React, { useEffect, useState } from 'react';
// import { fetchEvents, rsvpToEvent } from '../../api/eventsService';
// import EventSearch from './EventSearch';
// import './EventsList.css';
// import { getDistanceFromLatLonInMiles } from '../../utils/geolocationUtils';

// const EventsList = ({ onEventClick, onEventHover = () => {}, userLocation, setPosition, setEvents, isLoading, setIsLoading, loadError, setLoadError }) => {
//   const [eventList, setEventList] = useState([]);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [searchParams, setSearchParams] = useState({});

//   useEffect(() => {
//     if (userLocation) {
//       console.log('User location updated:', userLocation);
//       loadEvents(0, searchParams);
//     }
//   }, [userLocation]);

//   const loadEvents = async (page, params = {}) => {
//     if (!userLocation) {
//       console.error('User location is not defined.');
//       return;
//     }

//     setIsLoading(true);
//     setLoadError('');
//     try {
//       const lat = userLocation.lat || 40.730610; // Default latitude for New York City
//       const lng = userLocation.lng || -73.935242; // Default longitude for New York City
//       console.log(`Loading events for lat: ${lat}, lng: ${lng}, page: ${page}`);
//       const newEvents = await fetchEvents({ ...params, lat, lng, page });

//       // Calculate distance for each event
//       const eventsWithDistance = newEvents.map(event => ({
//         ...event,
//         distance: getDistanceFromLatLonInMiles(lat, lng, event.location.coordinates[1], event.location.coordinates[0])
//       }));

//       // Sort events by distance
//       eventsWithDistance.sort((a, b) => a.distance - b.distance);

//       setEventList((prevEvents) => (page === 0 ? eventsWithDistance : [...prevEvents, ...eventsWithDistance]));
//       setCurrentPage(page);
//       setEvents(eventsWithDistance);
//       console.log('Events loaded successfully:', eventsWithDistance);
//     } catch (error) {
//       console.error('Error loading events:', error);
//       setLoadError('Failed to load events');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleEventSelect = (event) => {
//     onEventClick(event);
//     console.log('Event selected:', event);
//   };

//   const handleRSVP = async (eventId, e) => {
//     e.stopPropagation();
//     try {
//       await rsvpToEvent(eventId);
//       alert('RSVP successful!');
//       console.log(`RSVP successful for event ID: ${eventId}`);
//     } catch (error) {
//       alert('Failed to RSVP');
//       console.error('RSVP error:', error);
//     }
//   };

//   const handleLoadMore = () => {
//     loadEvents(currentPage + 1, searchParams);
//   };

//   const handleSearch = (params) => {
//     setEventList([]);
//     setSearchParams(params);
//     loadEvents(0, params);
//   };

//   const handleGeolocation = async () => {
//     setIsLoading(true);
//     setLoadError('');
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const { latitude, longitude } = position.coords;
//           setPosition({ lat: latitude, lng: longitude });
//           await loadEvents(0, { ...searchParams, lat: latitude, lng: longitude });
//         },
//         (error) => {
//           console.error('Geolocation error:', error);
//           setLoadError('Failed to retrieve location');
//           setIsLoading(false);
//         }
//       );
//     } else {
//       console.error('Geolocation is not supported by this browser.');
//       setLoadError('Geolocation is not supported by this browser.');
//       setIsLoading(false);
//     }
//   };

//   if (isLoading && eventList.length === 0) {
//     return <p>Loading events...</p>;
//   }

//   if (loadError) {
//     return <p>{loadError}</p>;
//   }

//   if (!eventList || eventList.length === 0) {
//     return <p>No events available.</p>;
//   }

//   return (
//     <div className="event-list">
//       <EventSearch setEvents={handleSearch} />
//       <button onClick={handleGeolocation}>Use My Location</button>
//       {eventList.map((event, index) => (
//         <div
//           key={event._id ? `${event._id}-${index}` : index}
//           className="event-item"
//           onClick={() => handleEventSelect(event)}
//           onMouseEnter={() => onEventHover(event)}
//         >
//           <h3>{event.title}</h3>
//           <p>{new Date(event.date).toLocaleString()}</p>
//           <p>{event.location.address}</p>
//           <p>{event.distance !== undefined ? `${event.distance.toFixed(2)} miles away` : 'Distance unknown'}</p>
//           <button onClick={(e) => handleRSVP(event._id, e)}>RSVP</button>
//         </div>
//       ))}
//       <button onClick={handleLoadMore} className="load-more">Load More</button>
//       <p>Showing {eventList.length} events</p>
//     </div>
//   );
// };

// export default EventsList;

