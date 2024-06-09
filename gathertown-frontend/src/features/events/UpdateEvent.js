import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEventById, updateEvent } from '../../api/eventsService';

const UpdateEvent = ({ onUpdate }) => {
  const { eventId } = useParams();
  const [event, setEvent] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const fetchedEvent = await fetchEventById(eventId);
        setEvent(fetchedEvent);
      } catch (error) {
        console.error('Error fetching event:', error);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent({ ...event, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedEvent = await updateEvent(eventId, event);
      onUpdate(updatedEvent);
      navigate(`/events/${eventId}`);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  if (!event.title) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Update Event</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={event.title}
          onChange={handleChange}
          placeholder="Title"
        />
        <textarea
          name="description"
          value={event.description}
          onChange={handleChange}
          placeholder="Description"
        />
        <input
          type="date"
          name="date"
          value={event.date.split('T')[0]} // Format date for input
          onChange={handleChange}
        />
        <input
          type="time"
          name="time"
          value={event.time}
          onChange={handleChange}
        />
        <input
          type="text"
          name="category"
          value={event.category}
          onChange={handleChange}
          placeholder="Category"
        />
        <input
          type="text"
          name="location.street"
          value={event.location.street}
          onChange={handleChange}
          placeholder="Street"
        />
        <input
          type="text"
          name="location.city"
          value={event.location.city}
          onChange={handleChange}
          placeholder="City"
        />
        <input
          type="text"
          name="location.state"
          value={event.location.state}
          onChange={handleChange}
          placeholder="State"
        />
        <input
          type="text"
          name="location.country"
          value={event.location.country}
          onChange={handleChange}
          placeholder="Country"
        />
        <input
          type="text"
          name="location.zipCode"
          value={event.location.zipCode}
          onChange={handleChange}
          placeholder="Zip Code"
        />
        <button type="submit">Update Event</button>
      </form>
    </div>
  );
};

export default UpdateEvent;

