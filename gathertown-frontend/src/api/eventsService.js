//gathertown-frontend/src/api/eventsService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/events';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const fetchEvents = async (latitude, longitude, distance = 100000) => {
  const url = `${API_URL}/nearby`;
  const params = { lat: latitude, lng: longitude, distance };
  try {
    const response = await axios.get(url, {
      headers: getAuthHeader(),
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events based on location:', error);
    throw error;
  }
};

export const fetchEventsByZip = async (zipCode) => {
  const url = `${API_URL}/byZip`;
  const params = { zip: zipCode };
  try {
    const response = await axios.get(url, {
      headers: getAuthHeader(),
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events by zip code:', error);
    throw error;
  }
};

export const addEvent = async (eventData) => {
  try {
    const response = await axios.post(`${API_URL}`, eventData, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    console.error('Error adding event:', error);
    throw error;
  }
};

export const getEventDetails = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching event details:', error);
    throw error;
  }
};

export const submitEvent = async (eventData) => {
  try {
    const response = await axios.post(API_URL, eventData, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    console.error('Error submitting event:', error);
    throw error;
  }
};

export const updateEvent = async (id, eventData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, eventData, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export const rsvpToEvent = async (eventId) => {
  try {
    const response = await axios.post(`${API_URL}/${eventId}/rsvp`, {}, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    console.error('Error RSVPing to event:', error);
    throw error;
  }
};
