// HomePage.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MapComponent from '../components/MapComponent';
import { initializeRsvpStatus, handleRsvp } from '../utils/rsvpUtils';
import '../features/events/AllEventsList.css';
import './HomePage.css';

const HomePage = ({ isLoading, setIsLoading, loadError, setLoadError }) => {
  const [events, setEvents] = useState([]);
  const [rsvpStatus, setRsvpStatus] = useState([]);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 0, lng: 0 });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
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
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/events', {
          params: { latitude: userLocation.lat, longitude: userLocation.lng }
        });
        const fetchedEvents = response.data.events;
        setEvents(fetchedEvents);
        setRsvpStatus(initializeRsvpStatus(fetchedEvents));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoadError('Failed to fetch events. Please try again later.');
        setIsLoading(false);
      }
    };

    if (userLocation.lat !== 0 && userLocation.lng !== 0) {
      fetchEvents();
    }
  }, [userLocation, setIsLoading, setLoadError]);

  useEffect(() => {
    if (location.state && location.state.event) {
      const event = location.state.event;
      setEvents((prevEvents) => {
        if (!prevEvents.some(e => e._id === event._id)) {
          return [event, ...prevEvents];
        }
        return prevEvents;
      });
      setRsvpStatus(initializeRsvpStatus([event, ...events]));
      setSelectedEvent(event);
    }
  }, [location.state, events]);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    navigate(`/events/${event._id}`);
  };

  const handleEventHover = (event) => {
    setHoveredEvent(event._id);
    setSelectedEvent(event);
  };

  const handleEventMouseLeave = () => {
    setHoveredEvent(null);
    setSelectedEvent(null);
  };

  const handleRSVP = async (eventId, e) => {
    e.stopPropagation();
    await handleRsvp(eventId, rsvpStatus, setRsvpStatus, (error) => {
      console.error('RSVP error:', error);
      alert('Failed to RSVP. Please try again later.');
    });
  };

  const center = (hoveredEvent && hoveredEvent.location && hoveredEvent.location.coordinates) ? hoveredEvent.location.coordinates : [userLocation.lng, userLocation.lat];
  const zoom = hoveredEvent ? 15 : 12;

  return (
    <div className="outer-container">
      <header className="header">
        {/* ... your header content ... */}
      </header>

      <main className="main-content">
        <div className="events-column">
          <h1>Events</h1>
          {isLoading && <p>Loading...</p>}
          {loadError && <p>Error: {loadError}</p>}
          <div className="event-list">
            {events.map(event => (
              <div
                key={event._id}
                className={`event-item ${hoveredEvent === event._id ? 'expanded' : ''}`}
                onMouseEnter={() => handleEventHover(event)}
                onMouseLeave={handleEventMouseLeave}
              >
                <h2 onClick={() => handleEventClick(event)}>{event.title}</h2>
                <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                <p>Time: {new Date(event.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
                <p>{event.location?.city}, {event.location?.state}</p>
                {hoveredEvent === event._id && (
                  <div className="event-details-overlay">
                    <p><strong>Description:</strong> {event.description}</p>
                    <p><strong>Category:</strong> {event.category}</p>
                    <p><strong>Street:</strong> {event.location?.street}</p>
                    <p><strong>Creator:</strong> {event.creator?.name}</p>
                    <p><strong>Attendees:</strong> {event.attendees?.length || 0}</p>
                    {event.images && event.images.map((image, index) => (
                      <img key={index} src={image} alt="Event" style={{ width: '100px', height: '100px' }} />
                    ))}
                    <button onClick={(e) => handleRSVP(event._id, e)}>
                      {rsvpStatus.find(status => status.id === event._id)?.isRSVPed ? '✔️ RSVPed' : 'RSVP'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="map-column">
          <MapComponent center={center} zoom={zoom} events={events} selectedEvent={selectedEvent} />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
































// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import MapComponent from '../components/MapComponent';
// import { initializeRsvpStatus, handleRsvp } from '../utils/rsvpUtils';
// import '../features/events/AllEventsList.css';
// import './HomePage.css';

// const HomePage = ({ userLocation, isLoading, setIsLoading, loadError, setLoadError }) => {
//   const [events, setEvents] = useState([]);
//   const [rsvpStatus, setRsvpStatus] = useState([]);
//   const [hoveredEvent, setHoveredEvent] = useState(null);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const location = useLocation();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchEvents = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.get('http://localhost:5000/api/events/random-nearby', {
//           params: { latitude: userLocation.lat, longitude: userLocation.lng }
//         });
//         const fetchedEvents = response.data;
//         setEvents(fetchedEvents);
//         setRsvpStatus(initializeRsvpStatus(fetchedEvents));
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
//     if (location.state && location.state.event) {
//       const event = location.state.event;
//       setEvents((prevEvents) => {
//         if (!prevEvents.some(e => e._id === event._id)) {
//           return [event, ...prevEvents];
//         }
//         return prevEvents;
//       });
//       setRsvpStatus(initializeRsvpStatus([event, ...events]));
//       setSelectedEvent(event);
//     }
//   }, [location.state, events]);

//   const handleEventClick = (event) => {
//     setSelectedEvent(event);
//     navigate(`/events/${event._id}`);
//   };

//   const handleEventHover = (event) => {
//     setHoveredEvent(event._id);
//     setSelectedEvent(event);
//   };

//   const handleEventMouseLeave = () => {
//     setHoveredEvent(null);
//     setSelectedEvent(null);
//   };

//   const handleRSVP = async (eventId, e) => {
//     e.stopPropagation();
//     await handleRsvp(eventId, rsvpStatus, setRsvpStatus, (error) => {
//       console.error('RSVP error:', error);
//       alert('Failed to RSVP. Please try again later.');
//     });
//   };

//   const center = (hoveredEvent && hoveredEvent.location && hoveredEvent.location.coordinates) ? hoveredEvent.location.coordinates : [userLocation.lng, userLocation.lat];
//   const zoom = hoveredEvent ? 15 : 12;

//   return (
//     <div className="outer-container">
//       <header className="header">
//         {/* ... your header content ... */}
//       </header>

//       <main className="main-content">
//         <div className="events-column">
//           <h1>Nearby Events</h1>
//           {isLoading && <p>Loading...</p>}
//           {loadError && <p>Error: {loadError}</p>}
//           <div className="event-list">
//             {events.map(event => (
//               <div
//                 key={event._id}
//                 className={`event-item ${hoveredEvent === event._id ? 'expanded' : ''}`}
//                 onMouseEnter={() => handleEventHover(event)}
//                 onMouseLeave={handleEventMouseLeave}
//               >
//                 <h2 onClick={() => handleEventClick(event)}>{event.title}</h2>
//                 <p>Date: {new Date(event.date).toLocaleDateString()}</p>
//                 <p>Time: {new Date(event.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
//                 <p>{event.location?.city}, {event.location?.state}</p>
//                 {hoveredEvent === event._id && (
//                   <div className="event-details-overlay">
//                     <p><strong>Description:</strong> {event.description}</p>
//                     <p><strong>Category:</strong> {event.category}</p>
//                     <p><strong>Street:</strong> {event.location?.street}</p>
//                     <p><strong>Creator:</strong> {event.creator?.name}</p>
//                     <p><strong>Attendees:</strong> {event.attendees?.length || 0}</p>
//                     {event.images && event.images.map((image, index) => (
//                       <img key={index} src={image} alt="Event" style={{ width: '100px', height: '100px' }} />
//                     ))}
//                     <button onClick={(e) => handleRSVP(event._id, e)}>
//                       {rsvpStatus.find(status => status.id === event._id)?.isRSVPed ? '✔️ RSVPed' : 'RSVP'}
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//         <div className="map-column">
//           <MapComponent center={center} zoom={zoom} events={events} selectedEvent={selectedEvent} />
//         </div>
//       </main>
//     </div>
//   );
// };

// export default HomePage;















// import React, { useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import axios from 'axios';
// import MapComponent from '../components/MapComponent';
// import { initializeRsvpStatus, handleRsvp } from '../utils/rsvpUtils';
// import '../features/events/AllEventsList.css';
// import EventDetails from '../features/events/EventDetails';
// import './HomePage.css';

// const HomePage = ({ userLocation, isLoading, setIsLoading, loadError, setLoadError }) => {
//   const [events, setEvents] = useState([]);
//   const [rsvpStatus, setRsvpStatus] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [showEventDetails, setShowEventDetails] = useState(false);
//   const location = useLocation();

//   useEffect(() => {
//     const fetchEvents = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.get('http://localhost:5000/api/events/random-nearby', {
//           params: { latitude: userLocation.lat, longitude: userLocation.lng }
//         });
//         const fetchedEvents = response.data;
//         setEvents(fetchedEvents);
//         setRsvpStatus(initializeRsvpStatus(fetchedEvents));
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
//     if (location.state && location.state.event) {
//       const event = location.state.event;
//       setEvents((prevEvents) => [event, ...prevEvents]);
//       setRsvpStatus(initializeRsvpStatus([event, ...events])); 
//       handleEventClick(event); // Trigger event click to show details immediately
//     }
//   }, [location.state]);

//   const handleEventClick = (event) => {
//     setSelectedEvent(event);
//     setShowEventDetails(true); 
//   };

//   const handleEventHover = (event) => {
//     setSelectedEvent(event);
//   };

//   const handleRSVP = async (eventId, e) => {
//     e.stopPropagation();
//     await handleRsvp(eventId, rsvpStatus, setRsvpStatus, (error) => {
//       console.error('RSVP error:', error);
//       alert('Failed to RSVP. Please try again later.');
//     });
//   };

//   const center = selectedEvent ? selectedEvent.location.coordinates : [userLocation.lng, userLocation.lat];

//   return (
//     <div className="outer-container"> 
//       <header className="header">
//         {/* ... your header content ... */}
//       </header>

//       <main className="main-content">
//         <div className="events-section">
//           <h1>Nearby Events</h1>
//           {isLoading && <p>Loading...</p>}
//           {loadError && <p>Error: {loadError}</p>}
//           {events.map(event => (
//             <div 
//               key={event._id} 
//               className="event-item" 
//               onClick={() => handleEventClick(event)}
//               onMouseEnter={() => handleEventHover(event)}
//             >
//               <h2>{event.title}</h2>
//               <p>{event.description}</p>
//               <p>{new Date(event.date).toLocaleString()}</p>
//               <button onClick={(e) => handleRSVP(event._id, e)}>
//                 {rsvpStatus.find(status => status.id === event._id)?.isRSVPed ? 'You already RSVPed' : 'RSVP'}
//               </button>
//             </div>
//           ))}
//         </div>

//         <div className="map-and-details">
//           <MapComponent center={center} zoom={selectedEvent ? 15 : 12} events={events} selectedEvent={selectedEvent} />
//           {showEventDetails && selectedEvent && ( 
//             <div className="event-details">
//               <EventDetails event={selectedEvent} events={events} onUpdateEvent={setSelectedEvent} />
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default HomePage; 










// import React, { useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import axios from 'axios';
// import MapComponent from '../components/MapComponent';
// import { initializeRsvpStatus, handleRsvp } from '../utils/rsvpUtils';
// import '../features/events/AllEventsList.css';
// import EventDetails from '../features/events/EventDetails';
// import './HomePage.css';

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
//         const fetchedEvents = response.data;
//         setEvents(fetchedEvents);
//         setRsvpStatus(initializeRsvpStatus(fetchedEvents));
//         console.log('Fetched events:', fetchedEvents);
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
//     if (location.state && location.state.event) {
//       const event = location.state.event;
//       if (event) {
//         setEvents((prevEvents) => {
//           const updatedEvents = [event, ...prevEvents];
//           return updatedEvents;
//         });
//         setRsvpStatus((prevRsvpStatus) => {
//           const statusExists = prevRsvpStatus.some(status => status.id === event._id);
//           if (!statusExists) {
//             return [{ id: event._id, isRSVPed: event.isRSVPed || false }, ...prevRsvpStatus];
//           }
//           return prevRsvpStatus.map(status => 
//             status.id === event._id ? { ...status, isRSVPed: event.isRSVPed || false } : status
//           );
//         });
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















