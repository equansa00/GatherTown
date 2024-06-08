import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import MapComponent from '../components/MapComponent';
import { initializeRsvpStatus, handleRsvp } from '../utils/rsvpUtils';
import '../features/events/AllEventsList.css';
import EventDetails from '../features/events/EventDetails';

const HomePage = ({ userLocation, isLoading, setIsLoading, loadError, setLoadError, handleEventClick, handleEventHover, selectedEvent, setSelectedEvent }) => {
  const [events, setEvents] = useState([]);
  const [rsvpStatus, setRsvpStatus] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching events for location:', userLocation);
        const response = await axios.get('http://localhost:5000/api/events/random-nearby', {
          params: { latitude: userLocation.lat, longitude: userLocation.lng }
        });
        const fetchedEvents = response.data;
        setEvents(fetchedEvents);
        setRsvpStatus(initializeRsvpStatus(fetchedEvents));
        console.log('Fetched events:', fetchedEvents);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoadError('Failed to fetch events. Please try again later.');
        setIsLoading(false);
      }
    };

    if (events.length === 0) {
      fetchEvents();
    }
  }, [userLocation, setIsLoading, setLoadError, events.length]);

  useEffect(() => {
    if (location.state && location.state.event) {
      const event = location.state.event;
      if (event) {
        setEvents((prevEvents) => {
          const updatedEvents = [event, ...prevEvents];
          return updatedEvents;
        });
        setRsvpStatus((prevRsvpStatus) => {
          const statusExists = prevRsvpStatus.some(status => status.id === event._id);
          if (!statusExists) {
            return [{ id: event._id, isRSVPed: event.isRSVPed || false }, ...prevRsvpStatus];
          }
          return prevRsvpStatus.map(status => 
            status.id === event._id ? { ...status, isRSVPed: event.isRSVPed || false } : status
          );
        });
        setSelectedEvent(event);
      }
    }
  }, [location.state, setSelectedEvent]);

  const handleRSVP = async (eventId, e) => {
    e.stopPropagation();
    await handleRsvp(eventId, rsvpStatus, setRsvpStatus, (error) => {
      console.error('RSVP error:', error);
      alert('Failed to RSVP. Please try again later.');
    });
  };

  const center = selectedEvent ? selectedEvent.location.coordinates : [userLocation.lng, userLocation.lat];

  return (
    <div>
      <h1>Nearby Events</h1>
      {isLoading && <p>Loading...</p>}
      {loadError && <p>Error: {loadError}</p>}
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: 1, padding: '10px' }}>
          {events.map(event => (
            <div key={event._id} className="event-item" onClick={() => { handleEventClick(event); setSelectedEvent(event); }} onMouseEnter={() => handleEventHover(event)}>
              <h2>{event.title}</h2>
              <p>{event.description}</p>
              <p>{new Date(event.date).toLocaleString()}</p>
              <button onClick={(e) => handleRSVP(event._id, e)}>
                {rsvpStatus.find(status => status.id === event._id)?.isRSVPed ? 'You already RSVPed' : 'RSVP'}
              </button>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <MapComponent center={center} zoom={selectedEvent ? 15 : 12} events={events} selectedEvent={selectedEvent} />
        </div>
      </div>
      {selectedEvent && (
        <div style={{ marginTop: '20px' }}>
          <EventDetails event={selectedEvent} events={events} onUpdateEvent={setSelectedEvent} />
        </div>
      )}
    </div>
  );
};

export default HomePage;


















// import React, { useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import axios from 'axios';
// import MapComponent from '../components/MapComponent';
// import { initializeRsvpStatus, handleRsvp } from '../utils/rsvpUtils';
// import '../features/events/AllEventsList.css';
// import EventDetails from '../features/events/EventDetails';

// const HomePage = ({ userLocation, isLoading, setIsLoading, loadError, setLoadError, handleEventClick, handleEventHover, selectedEvent, setSelectedEvent }) => {
//   const [events, setEvents] = useState([]);
//   const [rsvpStatus, setRsvpStatus] = useState([]);
//   const location = useLocation();

//   useEffect(() => {
//     const fetchEvents = async () => {
//       setIsLoading(true);
//       try {
//         console.log('Fetching events for location:', userLocation);
//         const response = await axios.get('http://localhost:5000/api/events/random-nearby', {
//           params: { latitude: userLocation.lat, longitude: userLocation.lng }
//         });
//         setEvents(response.data);
//         setRsvpStatus(initializeRsvpStatus(response.data));
//         console.log('Fetched events:', response.data);
//         setIsLoading(false);
//       } catch (error) {
//         console.error('Error fetching events:', error);
//         setLoadError('Failed to fetch events. Please try again later.');
//         setIsLoading(false);
//       }
//     };

//     if (events.length === 0) {
//       fetchEvents();
//     }
//   }, [userLocation, setIsLoading, setLoadError, events.length]);

//   useEffect(() => {
//     if (location.state && location.state.eventId) {
//       const event = location.state.event;
//       if (event) {
//         setEvents((prevEvents) => [event, ...prevEvents]);
//         setSelectedEvent(event);
//       }
//     }
//   }, [location.state, setSelectedEvent]);

//   const handleRSVP = async (eventId, e) => {
//     e.stopPropagation();
//     await handleRsvp(eventId, rsvpStatus, setRsvpStatus, (error) => {
//       console.error('RSVP error:', error);
//       alert('Failed to RSVP. Please try again later.');
//     });
//   };

//   const center = selectedEvent ? selectedEvent.location.coordinates : [userLocation.lng, userLocation.lat];

//   return (
//     <div>
//       <h1>Nearby Events</h1>
//       {isLoading && <p>Loading...</p>}
//       {loadError && <p>Error: {loadError}</p>}
//       <div style={{ display: 'flex', flexDirection: 'row' }}>
//         <div style={{ flex: 1, padding: '10px' }}>
//           {events.map(event => (
//             <div key={event._id} className="event-item" onClick={() => { handleEventClick(event); setSelectedEvent(event); }} onMouseEnter={() => handleEventHover(event)}>
//               <h2>{event.title}</h2>
//               <p>{event.description}</p>
//               <p>{new Date(event.date).toLocaleString()}</p>
//               <button onClick={(e) => handleRSVP(event._id, e)}>
//                 {rsvpStatus.find(status => status.id === event._id)?.isRSVPed ? 'You already RSVPed' : 'RSVP'}
//               </button>
//             </div>
//           ))}
//         </div>
//         <div style={{ flex: 1 }}>
//           <MapComponent center={center} zoom={selectedEvent ? 15 : 12} events={events} selectedEvent={selectedEvent} />
//         </div>
//       </div>
//       {selectedEvent && (
//         <div style={{ marginTop: '20px' }}>
//           <EventDetails event={selectedEvent} events={events} onUpdateEvent={setSelectedEvent} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default HomePage;

