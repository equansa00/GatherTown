import React, { useEffect, useState, useCallback } from 'react';
import { fetchEventsNearby, fetchRandomEvents, rsvpToEvent } from '../../api/eventsService';
import { getDistanceFromLatLonInMiles } from '../../utils/geolocationUtils';
// import './HomeEventsList.css';

const HomeEventsList = ({
  onEventClick,
  onEventHover = () => {},
  setIsLoading,
  loadError,
  setLoadError,
  isLoading,
  userLocation
}) => {
  const [eventList, setEventList] = useState([]);
  const [rsvpStatus, setRsvpStatus] = useState([]);
  const [showNearbyEvents, setShowNearbyEvents] = useState(true);

  const logMessage = (message) => {
    console.log(`[HomeEventsList] ${message}`);
  };

  const loadNearbyEvents = useCallback(async () => {
    logMessage('Loading nearby events');

    setIsLoading(true);
    setLoadError('');

    try {
      const nearbyEvents = await fetchEventsNearby({
        lat: userLocation.lat,
        lng: userLocation.lng,
        maxDistance: 160934 // 100 miles in meters
      });
      logMessage(`Fetched ${nearbyEvents.length} nearby events from API`);

      const eventsWithDistance = nearbyEvents.map(event => ({
        ...event,
        distance: getDistanceFromLatLonInMiles(userLocation.lat, userLocation.lng, event.location.coordinates[1], event.location.coordinates[0])
      }));

      setEventList(eventsWithDistance);
      setRsvpStatus(eventsWithDistance.map(event => ({ id: event._id, isRSVPed: event.isRSVPed })));
    } catch (error) {
      logMessage(`Error loading events: ${error.message}`);
      setLoadError('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
      logMessage('Finished loading events');
    }
  }, [setIsLoading, setLoadError, userLocation]);

  const loadRandomEvents = useCallback(async () => {
    logMessage('Loading random events');

    setIsLoading(true);
    setLoadError('');

    try {
      const randomEvents = await fetchRandomEvents(5);
      logMessage(`Fetched ${randomEvents.length} random events from API`);

      const eventsWithDistance = randomEvents.map(event => ({
        ...event,
        distance: getDistanceFromLatLonInMiles(userLocation.lat, userLocation.lng, event.location.coordinates[1], event.location.coordinates[0])
      }));

      setEventList(eventsWithDistance);
      setRsvpStatus(eventsWithDistance.map(event => ({ id: event._id, isRSVPed: event.isRSVPed })));
    } catch (error) {
      logMessage(`Error loading events: ${error.message}`);
      setLoadError('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
      logMessage('Finished loading events');
    }
  }, [setIsLoading, setLoadError, userLocation]);

  useEffect(() => {
    if (showNearbyEvents) {
      loadNearbyEvents();
    } else {
      loadRandomEvents();
    }
  }, [loadNearbyEvents, loadRandomEvents, showNearbyEvents]);

  const handleEventSelect = (event) => {
    logMessage(`Event selected: ${event.title}`);
    onEventClick(event);
  };

  const handleRSVP = async (eventId, isRSVPed, e) => {
    e.stopPropagation();
    if (isRSVPed) {
      alert('You have already RSVPed to this event.');
      return;
    }
    try {
      await rsvpToEvent(eventId);
      alert('RSVP successful!');
      setRsvpStatus(rsvpStatus.map(status => (status.id === eventId ? { ...status, isRSVPed: true } : status)));
    } catch (error) {
      alert('Failed to RSVP');
      console.error('RSVP error:', error);
    }
  };

  if (!eventList || eventList.length === 0) {
    return <p>No events available.</p>;
  }

  return (
    <div className="events-list-container">
      <div className="toggle-buttons">
        <button onClick={() => setShowNearbyEvents(true)} disabled={showNearbyEvents}>Nearby Events</button>
        <button onClick={() => setShowNearbyEvents(false)} disabled={!showNearbyEvents}>Random Events</button>
      </div>
      <div className="events-list">
        {eventList.map((event) => (
          <div
            key={event._id}
            className="event-item"
            onClick={() => handleEventSelect(event)}
            onMouseEnter={() => onEventHover(event)}
          >
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>{new Date(event.date).toLocaleString()}</p>
            <p>{event.location.streetAddress}, {event.location.city}, {event.location.state}, {event.location.country}, {event.location.zipCode}</p>
            <p>Distance: {event.distance ? `${event.distance.toFixed(2)} miles` : 'N/A'}</p>
            <div className="event-description">
              <p>Description: {event.description}</p>
              <p>Date: {new Date(event.date).toLocaleDateString()}</p>
              <p>Time: {event.time}</p>
            </div>
            <button onClick={(e) => handleRSVP(event._id, event.isRSVPed || rsvpStatus.find(status => status.id === event._id).isRSVPed, e)}>
              {event.isRSVPed || rsvpStatus.find(status => status.id === event._id).isRSVPed ? '✔️ RSVPed' : 'RSVP'}
            </button>
          </div>
        ))}
      </div>
      {isLoading && <p>Loading...</p>}
      {loadError && <p>{loadError}</p>}
      {eventList.length === 0 && !isLoading && !loadError && <p>No events available</p>}
    </div>
  );
};

export default HomeEventsList;




// import React, { useEffect, useState, useCallback } from 'react';
// import { fetchEventsNearby, rsvpToEvent } from '../../api/eventsService';
// import { getDistanceFromLatLonInMiles } from '../../utils/geolocationUtils';
// // import './HomeEventsList.css';

// const HomeEventsList = ({
//   onEventClick,
//   onEventHover = () => {},
//   setIsLoading,
//   loadError,
//   setLoadError,
//   isLoading,
//   userLocation
// }) => {
//   const [eventList, setEventList] = useState([]);
//   const [rsvpStatus, setRsvpStatus] = useState([]);

//   const logMessage = (message) => {
//     console.log(`[HomeEventsList] ${message}`);
//   };

//   const loadEvents = useCallback(async () => {
//     logMessage('Loading nearby events');

//     setIsLoading(true);
//     setLoadError('');

//     try {
//       const nearbyEvents = await fetchEventsNearby({
//         lat: userLocation.lat,
//         lng: userLocation.lng,
//         maxDistance: 160934 // 100 miles in meters
//       });
//       logMessage(`Fetched ${nearbyEvents.length} nearby events from API`);

//       const eventsWithDistance = nearbyEvents.map(event => ({
//         ...event,
//         distance: getDistanceFromLatLonInMiles(userLocation.lat, userLocation.lng, event.location.coordinates[1], event.location.coordinates[0])
//       }));

//       setEventList(eventsWithDistance);
//       setRsvpStatus(eventsWithDistance.map(event => ({ id: event._id, isRSVPed: event.isRSVPed })));
//     } catch (error) {
//       logMessage(`Error loading events: ${error.message}`);
//       setLoadError('Failed to load events. Please try again later.');
//     } finally {
//       setIsLoading(false);
//       logMessage('Finished loading events');
//     }
//   }, [setIsLoading, setLoadError, userLocation]);

//   useEffect(() => {
//     loadEvents();
//   }, [loadEvents]);

//   const handleEventSelect = (event) => {
//     logMessage(`Event selected: ${event.title}`);
//     onEventClick(event);
//   };

//   const handleRSVP = async (eventId, isRSVPed, e) => {
//     e.stopPropagation();
//     if (isRSVPed) {
//       alert('You have already RSVPed to this event.');
//       return;
//     }
//     try {
//       await rsvpToEvent(eventId);
//       alert('RSVP successful!');
//       setRsvpStatus(rsvpStatus.map(status => (status.id === eventId ? { ...status, isRSVPed: true } : status)));
//     } catch (error) {
//       alert('Failed to RSVP');
//       console.error('RSVP error:', error);
//     }
//   };

//   if (!eventList || eventList.length === 0) {
//     return <p>No events available.</p>;
//   }

//   return (
//     <div className="events-list-container">
//       <div className="events-list">
//         {eventList.map((event) => (
//           <div
//             key={event._id}
//             className="event-item"
//             onClick={() => handleEventSelect(event)}
//             onMouseEnter={() => onEventHover(event)}
//           >
//             <h3>{event.title}</h3>
//             <p>{event.description}</p>
//             <p>{new Date(event.date).toLocaleString()}</p>
//             <p>{event.location.streetAddress}, {event.location.city}, {event.location.state}, {event.location.country}, {event.location.zipCode}</p>
//             <p>Distance: {event.distance ? `${event.distance.toFixed(2)} miles` : 'N/A'}</p>
//             <div className="event-description">
//               <p>Description: {event.description}</p>
//               <p>Date: {new Date(event.date).toLocaleDateString()}</p>
//               <p>Time: {event.time}</p>
//             </div>
//             <button onClick={(e) => handleRSVP(event._id, event.isRSVPed || rsvpStatus.find(status => status.id === event._id).isRSVPed, e)}>
//               {event.isRSVPed || rsvpStatus.find(status => status.id === event._id).isRSVPed ? '✔️ RSVPed' : 'RSVP'}
//             </button>
//           </div>
//         ))}
//       </div>
//       {isLoading && <p>Loading...</p>}
//       {loadError && <p>{loadError}</p>}
//       {eventList.length === 0 && !isLoading && !loadError && <p>No events available</p>}
//     </div>
//   );
// };

// export default HomeEventsList;
