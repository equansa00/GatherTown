import axios from 'axios';
import { getAuthHeader } from '../utils/auth';

const logMessage = (message) => {
  console.log(`[eventsService] ${message}`);
};

// Logging all requests and responses
axios.interceptors.request.use(request => {
  console.log(`Request: ${JSON.stringify(request, null, 2)}`);
  return request;
});

axios.interceptors.response.use(response => {
  console.log(`Response: ${JSON.stringify(response, null, 2)}`);
  return response;
}, error => {
  console.log('Error:', error.response ? JSON.stringify(error.response, null, 2) : error.message);
  return Promise.reject(error);
});

const API_URL = 'http://localhost:5000/api/events';

export const fetchEventsNearby = async ({ lat, lng, maxDistance = 160934, page = 0, limit = 5 }) => {
  try {
    const response = await axios.get(`${API_URL}/nearby`, {
      params: { lat, lng, maxDistance, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby events:', error);
    throw error;
  }
};

export const fetchRandomEvents = async (count = 5) => {
  try {
    const response = await axios.get(`${API_URL}/random`, { params: { count } });
    logMessage(`Fetched random events: ${response.data.length}`);
    return response.data;
  } catch (error) {
    logMessage('Error fetching random events');
    throw new Error('Error fetching random events');
  }
};

export const fetchEvents = async (params) => {
  try {
    logMessage(`Fetching events with params: ${JSON.stringify(params)}`);
    const response = await axios.get(API_URL, { params });
    logMessage(`Fetched ${response.data.events.length} events`);
    return response.data;
  } catch (error) {
    logMessage(`Error fetching events: ${error.message}`);
    throw error;
  }
};

export const fetchAllEvents = async (params) => {
  try {
    const response = await axios.get(API_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const fetchCountries = async () => {
  try {
    const response = await axios.get('/api/events/countries');
    return response.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

export const fetchStates = async (country) => {
  try {
    const response = await axios.get(`/api/events/states?country=${country}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching states:', error);
    throw error;
  }
};

export const fetchCities = async (country, state) => {
  try {
    const response = await axios.get(`/api/events/cities?country=${country}&state=${state}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

export const fetchEventsByZip = async (zipCode, page = 0) => {
  const url = `${API_URL}/by-zip`;
  logMessage(`Fetching events by zip code: ${zipCode}, page: ${page}`);
  
  try {
    const response = await axios.get(url, {
      headers: getAuthHeader(),
      params: { zipCode, page }
    });
    logMessage(`Fetched events by zip: ${response.data.length}`);
    return response.data;
  } catch (error) {
    logMessage('Error fetching events by zip');
    handleAxiosError(error);
    throw error;
  }
};

export const addEvent = async (eventData) => {
  logMessage("Adding event:", eventData);
  try {
    const response = await axios.post(API_URL, eventData, { headers: getAuthHeader() });
    logMessage('Event added successfully');
    return response.data;
  } catch (error) {
    logMessage('Error adding event');
    handleAxiosError(error);
    throw error;
  }
};

export const getEventDetails = async (id) => {
  logMessage(`Fetching event details for ID: ${id}`);
  try {
    const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
    logMessage(`Event details fetched successfully`);
    return response.data;
  } catch (error) {
    logMessage(`Error fetching event details: ${error.message}`);
    throw error;
  }
};

export const updateEvent = async (id, eventData) => {
  logMessage(`Updating event ID: ${id}`, eventData);
  try {
    const response = await axios.put(`${API_URL}/${id}`, eventData, { headers: getAuthHeader() });
    logMessage('Event updated successfully');
    return response.data;
  } catch (error) {
    logMessage('Error updating event');
    handleAxiosError(error);
    throw error;
  }
};

export const deleteEvent = async (id) => {
  logMessage(`Deleting event ID: ${id}`);
  try {
    const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
    logMessage('Event deleted successfully');
    return response.data;
  } catch (error) {
    logMessage('Error deleting event');
    handleAxiosError(error);
    throw error;
  }
};

export const rsvpToEvent = async (eventId) => {
  console.log(`[rsvpToEvent] RSVPing to event ID: ${eventId}`);
  try {
    const response = await axios.post(`${API_URL}/${eventId}/rsvp`, {}, { headers: getAuthHeader() });
    console.log(`[rsvpToEvent] RSVP successful. Response data: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error) {
    console.error(`[rsvpToEvent] Error RSVPing to event: ${error.message}`);
    throw error;
  } finally {
    console.log('[rsvpToEvent] Finished RSVP process');
  }
};

const handleAxiosError = (error) => {
  if (error.response) {
    logMessage('Error response:', {
      data: error.response.data,
      status: error.response.status,
      headers: error.response.headers,
    });
  } else if (error.request) {
    logMessage('No response received:', error.request);
  } else {
    logMessage('Error setting up request:', error.message);
  }
};

export default {
  fetchRandomEvents,
  fetchEvents,
  fetchAllEvents,
  fetchEventsByZip,
  addEvent,
  getEventDetails,
  updateEvent,
  deleteEvent,
  rsvpToEvent,
};
