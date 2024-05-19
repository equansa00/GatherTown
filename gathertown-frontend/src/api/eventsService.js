import axios from 'axios';

const API_URL = '/api/events';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { 'Authorization': `Bearer ${token}` };
};

export const fetchEvents = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/events', {
      headers: getAuthHeader()
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const addEvent = async (eventData) => {
  try {
    const response = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });
    if (!response.ok) {
      throw new Error('Failed to add event');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding event:', error);
    return null;
  }
};

export const getEventDetails = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching event details:', error);
    throw error;
  }
};

export const submitEvent = async (eventData) => {
  try {
    const response = await axios.post(API_URL, eventData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error submitting event:', error);
    throw error;
  }
};

export const updateEvent = async (id, eventData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export const rsvpToEvent = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/rsvp`);
    return response.data;
  } catch (error) {
    console.error('Error RSVPing to event:', error);
    throw error;
  }
};
