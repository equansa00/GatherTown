import React, { useState, useEffect } from 'react';
import { fetchEvents } from '../api/eventsService';
import { useAuth } from '../context/AuthContext';

const EventDiscovery = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  console.log("Rendering EventDiscovery page", { user: user ? user.token : "No user" });

  useEffect(() => {
    console.log("Fetching events for EventDiscovery");
    async function fetchEventsData() {
      try {
        const eventsData = await fetchEvents();
        console.log("Fetched events:", eventsData);
        setEvents(eventsData || []); // Ensure events is an array even if undefined
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    }

    fetchEventsData();
  }, []);

  if (loading) return <div>Loading events...</div>;

  return (
    <div>
      {user && <p>Welcome back, {user.name || "User"}! Here are the latest events:</p>}
      <h2>Discover Events</h2>
      {events.length > 0 ? (
        <ul>
          {events.map(event => (
            <li key={event._id}>{event.title} - {event.date}</li>
          ))}
        </ul>
      ) : (
        <p>No events found.</p>
      )}
    </div>
  );
};

export default EventDiscovery;



// // src/pages/EventDiscovery.js
// import React, { useState, useEffect } from 'react';
// import { fetchEvents } from '../api/eventsService';
// import { useAuth } from '../context/AuthContext';

// const EventDiscovery = () => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { user } = useAuth();

//   console.log("Rendering EventDiscovery page", { user: user ? user.token : "No user" });

//   useEffect(() => {
//     console.log("Fetching events for EventDiscovery");
//     async function fetchEventsData() {
//       try {
//         const response = await fetchEvents();
//         console.log("Fetched events:", response.data);
//         setEvents(response.data);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching events:", error);
//         setLoading(false);
//       }
//     }

//     fetchEventsData();
//   }, []);

//   if (loading) return <div>Loading events...</div>;

//   return (
//     <div>
//       {user && <p>Welcome back, {user.name}! Here are the latest events:</p>}
//       <h2>Discover Events</h2>
//       {events.length > 0 ? (
//         <ul>
//           {events.map(event => (
//             <li key={event._id}>{event.title} - {event.date}</li>
//           ))}
//         </ul>
//       ) : (
//         <p>No events found.</p>
//       )}
//     </div>
//   );
// };

// export default EventDiscovery;