// src/features/events/DeleteEventButton.js
import React from 'react';
import axios from 'axios';

const DeleteEventButton = ({ eventId }) => {
  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Event deleted:', response.data);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <button onClick={handleDelete}>Delete Event</button>
  );
};

export default DeleteEventButton;
