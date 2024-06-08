import React, { useEffect, useState } from 'react';
import './AllEventsList.css';

const AllEventsList = ({ events, onEventClick, onEventHover, rsvpStatus, handleShowOnMap, handleRSVP, highlightedEventId }) => {
  const [expandedEventId, setExpandedEventId] = useState(null);

  useEffect(() => {
    if (highlightedEventId) {
      const element = document.getElementById(highlightedEventId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setExpandedEventId(highlightedEventId);
      }
    }
  }, [highlightedEventId]);

  const handleEventSelect = (event) => {
    setExpandedEventId(event._id === expandedEventId ? null : event._id);
    console.log('Event selected:', event);
  };

  return (
    <div className="event-list">
      {events && events.map((event) => (
        <div
          key={event._id}
          id={event._id}
          className={`event-item ${expandedEventId === event._id ? 'expanded' : ''}`}
          onClick={() => {
            handleEventSelect(event);
            if (onEventClick) onEventClick(event);
          }}
          onMouseEnter={() => onEventHover && onEventHover(event)}
        >
          <h3>{event.title}</h3>
          {expandedEventId === event._id ? (
            <div className="event-description">
              <p><strong>Description:</strong> {event.description}</p>
              <p><strong>Category:</strong> {event.category}</p>
              <p><strong>Location:</strong> {event.location.city}, {event.location.state}, {event.location.country}</p>
              <p><strong>Street:</strong> {event.location.street}</p>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {event.time}</p>
              <p><strong>Creator:</strong> {event.creator.name}</p>
              <p><strong>Attendees:</strong> {event.attendees.length}</p>
              {event.images && event.images.map((image, index) => (
                <img key={index} src={image} alt="Event" style={{ width: '100px', height: '100px' }} />
              ))}
              <button onClick={(e) => handleRSVP(event._id, e)}>
                {rsvpStatus.find(status => status.id === event._id)?.isRSVPed ? '✔️ RSVPed' : 'RSVP'}
              </button>
              <button onClick={() => handleShowOnMap(event)}>View on Map</button>
            </div>
          ) : (
            <>
              <p>{new Date(event.date).toLocaleDateString()}</p>
              <button onClick={(e) => handleRSVP(event._id, e)}>
                {rsvpStatus.find(status => status.id === event._id)?.isRSVPed ? '✔️ RSVPed' : 'RSVP'}
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default AllEventsList;

















// // src/features/events/AllEventsList.js
// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import './AllEventsList.css';

// const AllEventsList = ({ events, onEventClick, onEventHover, rsvpStatus, handleShowOnMap, handleRSVP }) => {
//   const [expandedEventId, setExpandedEventId] = useState(null);
//   const { eventId } = useParams();

//   useEffect(() => {
//     if (eventId) {
//       const element = document.getElementById(eventId);
//       if (element) {
//         element.scrollIntoView({ behavior: 'smooth' });
//         setExpandedEventId(eventId);
//       }
//     }
//   }, [eventId]);

//   const handleEventSelect = (event) => {
//     setExpandedEventId(event._id === expandedEventId ? null : event._id);
//     console.log('Event selected:', event);
//   };

//   return (
//     <div className="event-list">
//       {events && events.map((event) => (
//         <div
//           key={event._id}
//           id={event._id}
//           className={`event-item ${expandedEventId === event._id ? 'expanded' : ''}`}
//           onClick={() => {
//             handleEventSelect(event);
//             if (onEventClick) onEventClick(event);
//           }}
//           onMouseEnter={() => onEventHover && onEventHover(event)}
//         >
//           <h3>{event.title}</h3>
//           {expandedEventId === event._id ? (
//             <div className="event-description">
//               <p><strong>Description:</strong> {event.description}</p>
//               <p><strong>Category:</strong> {event.category}</p>
//               <p><strong>Location:</strong> {event.location.city}, {event.location.state}, {event.location.country}</p>
//               <p><strong>Street:</strong> {event.location.street}</p>
//               <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
//               <p><strong>Time:</strong> {event.time}</p>
//               <p><strong>Creator:</strong> {event.creator.name}</p>
//               <p><strong>Attendees:</strong> {event.attendees.length}</p>
//               {event.images && event.images.map((image, index) => (
//                 <img key={index} src={image} alt="Event" style={{ width: '100px', height: '100px' }} />
//               ))}
//               <button onClick={(e) => handleRSVP(event._id, e)}>
//                 {rsvpStatus.find(status => status.id === event._id)?.isRSVPed ? '✔️ RSVPed' : 'RSVP'}
//               </button>
//               <button onClick={() => handleShowOnMap(event)}>View on Map</button>
//             </div>
//           ) : (
//             <>
//               <p>{new Date(event.date).toLocaleDateString()}</p>
//               <button onClick={(e) => handleRSVP(event._id, e)}>
//                 {rsvpStatus.find(status => status.id === event._id)?.isRSVPed ? '✔️ RSVPed' : 'RSVP'}
//               </button>
//             </>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default AllEventsList;
