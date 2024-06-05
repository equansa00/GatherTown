import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './AllEventsList.css';
import { initializeRsvpStatus, handleRsvp } from '../../utils/rsvpUtils';

const AllEventsList = () => {
  const [events, setEvents] = useState([]);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [rsvpStatus, setRsvpStatus] = useState([]);
  const { eventId } = useParams();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        const eventsData = response.data.events;

        // Initialize RSVP statuses for all events
        setRsvpStatus(initializeRsvpStatus(eventsData));
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (eventId) {
      const element = document.getElementById(eventId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setExpandedEventId(eventId);
      }
    }
  }, [eventId]);

  const handleEventSelect = (event) => {
    setExpandedEventId(event._id === expandedEventId ? null : event._id);
  };

  const handleRSVP = async (eventId, e) => {
    e.stopPropagation();
    await handleRsvp(eventId, rsvpStatus, setRsvpStatus, (error) => {
      console.error('RSVP error:', error);
    });
  };

  return (
    <div className="event-list">
      {events.map((event) => (
        <div
          key={event._id}
          id={event._id}
          className={`event-item ${expandedEventId === event._id ? 'expanded' : ''}`}
          onClick={() => handleEventSelect(event)}
        >
          <h3>{event.title}</h3>
          <p>{new Date(event.date).toLocaleString()}</p>
          {expandedEventId === event._id && (
            <div className="event-description">
              <p>{event.description}</p>
              {/* Add other detailed event information here */}
            </div>
          )}
          <button onClick={(e) => handleRSVP(event._id, e)}>
            {rsvpStatus.find(status => status.id === event._id)?.isRSVPed ? '✔️ RSVPed' : 'RSVP'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default AllEventsList;

