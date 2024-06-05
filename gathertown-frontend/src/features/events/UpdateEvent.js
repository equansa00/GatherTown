// src/features/events/UpdateEvent.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UpdateEvent = ({ eventId }) => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    category: '',
    location: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      coordinates: []
    },
    images: [],
    demographics: {
      ageGroup: '',
      interests: []
    },
    tags: []
  });

  useEffect(() => {
    const fetchEvent = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEventData(response.data);
      } catch (error) {
        console.error('Error fetching event:', error);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await axios.put(`http://localhost:5000/api/events/${eventId}`, eventData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Event updated:', response.data);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" value={eventData.title} onChange={handleChange} placeholder="Title" required />
      <textarea name="description" value={eventData.description} onChange={handleChange} placeholder="Description" required />
      <input type="date" name="date" value={eventData.date} onChange={handleChange} required />
      <input type="time" name="time" value={eventData.time} onChange={handleChange} required />
      <input type="text" name="category" value={eventData.category} onChange={handleChange} placeholder="Category" required />
      <input type="text" name="location.street" value={eventData.location.street} onChange={handleChange} placeholder="Street" required />
      <input type="text" name="location.city" value={eventData.location.city} onChange={handleChange} placeholder="City" required />
      <input type="text" name="location.state" value={eventData.location.state} onChange={handleChange} placeholder="State" required />
      <input type="text" name="location.country" value={eventData.location.country} onChange={handleChange} placeholder="Country" required />
      <input type="text" name="location.zipCode" value={eventData.location.zipCode} onChange={handleChange} placeholder="Zip Code" required />
      <input type="text" name="location.coordinates" value={eventData.location.coordinates} onChange={handleChange} placeholder="Coordinates" required />
      <button type="submit">Update Event</button>
    </form>
  );
};

export default UpdateEvent;
