//gathertown-frontend/src/features/events/CreateEvent.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateEvent = () => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    category: 'Other',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    coordinates: [0, 0],
    images: '',
    ageGroup: '',
    interests: '',
    tags: '',
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input change - ${name}: ${value}`);
    setEventData({
      ...eventData,
      [name]: value,
    });
  };

  const handleCoordinatesChange = (e, index) => {
    const updatedCoordinates = [...eventData.coordinates];
    updatedCoordinates[index] = parseFloat(e.target.value);
    console.log(`Coordinates change - Index: ${index}, Value: ${e.target.value}`);
    setEventData({ ...eventData, coordinates: updatedCoordinates });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const event = {
      ...eventData,
      images: eventData.images.split(','),
      interests: eventData.interests.split(','),
      tags: eventData.tags.split(','),
      location: {
        type: 'Point',
        coordinates: eventData.coordinates,
        street: eventData.street,
        city: eventData.city,
        state: eventData.state,
        country: eventData.country,
        zipCode: eventData.zipCode,
      },
    };

    try {
      const response = await axios.post('http://localhost:5000/api/events', event, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Event created successfully:', response.data);
      navigate(`/all-events/${response.data.event._id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request data:', error.request);
      } else {
        console.error('General error message:', error.message);
      }
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <label>
        Title:
        <input
          type="text"
          name="title"
          value={eventData.title}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Description:
        <textarea
          name="description"
          value={eventData.description}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Date:
        <input
          type="date"
          name="date"
          value={eventData.date}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Time:
        <input
          type="time"
          name="time"
          value={eventData.time}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Category:
        <select
          name="category"
          value={eventData.category}
          onChange={handleInputChange}
          required
        >
          <option value="Music">Music</option>
          <option value="Sports">Sports</option>
          <option value="Art">Art</option>
          <option value="Food">Food</option>
          <option value="Tech">Tech</option>
          <option value="Recreation">Recreation</option>
          <option value="Other">Other</option>
        </select>
      </label>
      <label>
        Street:
        <input
          type="text"
          name="street"
          value={eventData.street}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        City:
        <input
          type="text"
          name="city"
          value={eventData.city}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        State:
        <input
          type="text"
          name="state"
          value={eventData.state}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Country:
        <input
          type="text"
          name="country"
          value={eventData.country}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Zip Code:
        <input
          type="text"
          name="zipCode"
          value={eventData.zipCode}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Coordinates:
        <input
          type="number"
          name="longitude"
          value={eventData.coordinates[0]}
          onChange={(e) => handleCoordinatesChange(e, 0)}
          required
        />
        <input
          type="number"
          name="latitude"
          value={eventData.coordinates[1]}
          onChange={(e) => handleCoordinatesChange(e, 1)}
          required
        />
      </label>
      <label>
        Images (comma-separated URLs):
        <input
          type="text"
          name="images"
          value={eventData.images}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Age Group:
        <input
          type="text"
          name="ageGroup"
          value={eventData.ageGroup}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Interests (comma-separated):
        <input
          type="text"
          name="interests"
          value={eventData.interests}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Tags (comma-separated):
        <input
          type="text"
          name="tags"
          value={eventData.tags}
          onChange={handleInputChange}
        />
      </label>
      <button type="submit">Create Event</button>
    </form>
  );
};

export default CreateEvent;
