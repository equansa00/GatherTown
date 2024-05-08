import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css'; // Ensure this CSS file contains the styles for the event card.

function EventCard({ event, onRSVP }) {
    if (!event) {
        return <p>No event data available.</p>;
      }
  const handleRSVP = () => {
    if (onRSVP) {
      onRSVP(event.id); // Trigger RSVP handler provided as a prop.
    }
  };

  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <p><strong>Description:</strong> {event.description}</p>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <Link to={`/events/${event.id}`}>More Details</Link>
      <button onClick={handleRSVP}>RSVP</button>
    </div>
  );
}

export default EventCard;
