// frontend/src/features/events/EventsList.js
import React, { useState, useEffect } from 'react';
import { fetchEvents } from '../../api/eventsService';  // Ensure this path matches the location of your fetchEvents function
import EventDetailsModal from './EventDetailsModal';  // Importing the modal component for showing event details

function EventsList() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchEvents();
        console.log("Data received from fetchEvents:", JSON.stringify(data));
        if (data && Array.isArray(data)) {
          setEvents(data);
          console.log("Events set successfully:", data);
        } else {
          throw new Error('Data is not an array');  // Throwing an error if data is not an array
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);  // Ensuring the events state is set to an empty array in case of error
      }
    };
    
    fetchData();
  }, []);

  const handleEventClick = (event) => {
    setSelectedEvent(event);  // Setting the clicked event as the selected event
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);  // Resetting the selected event on modal close
  };

  return (
    <div>
      {events.map(event => (
        <div key={event._id} onClick={() => handleEventClick(event)}>
          <h3>{event.title}</h3>  {/* Displaying the title of each event */}
        </div>
      ))}
      {selectedEvent && (
        <EventDetailsModal event={selectedEvent} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default EventsList;
