import axios from 'axios';
import { getAuthHeader } from '../utils/auth';

// Logging functions
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

// Fetch Event by ID
export const fetchEventById = async (eventId) => {
  try {
    const response = await axios.get(`${API_URL}/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    throw error;
  }
};

// Fetch Random Nearby Events
export const fetchRandomNearbyEvents = async (lat, lng, radius = 5000, count = 5) => {
  try {
    const response = await axios.get(`${API_URL}/random-nearby`, {
      params: { latitude: lat, longitude: lng, radius, count },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching random nearby events:', error);
    throw error;
  }
};

// Fetch Random Events
export const fetchRandomEvents = async (count = 5) => {
  try {
    const response = await axios.get(`${API_URL}/random`, { params: { count } });
    return response.data;
  } catch (error) {
    console.error('Error fetching random events:', error);
    throw error;
  }
};

// Fetch Events with Parameters
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

// Fetch All Events
export const fetchAllEvents = async (params) => {
  try {
    const response = await axios.get(API_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const fetchEventsByZip = async (zipCode, page = 1) => {
  const url = `${API_URL}/events/by-zip`;
  logMessage(`Fetching events by zip code: ${zipCode}, page: ${page}`);
  
  try {
    const response = await axios.get(url, {
      headers: getAuthHeader(),
      params: { zipCode, page }
    });
    logMessage(`Fetched events by zip: ${response.data.events.length}`);
    return response.data;
  } catch (error) {
    logMessage('Error fetching events by zip');
    handleAxiosError(error);
    throw error;
  }
};

// Add Event
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

// Get Event Details
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

// Update Event
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

// Delete Event
export const deleteEvent = async (eventId) => {
  const response = await axios.delete(`${API_URL}/${eventId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return response.data;
};

// RSVP to Event
export async function rsvpToEvent(eventId) {
  try {
    const response = await axios.post(`${API_URL}/${eventId}/rsvp`, {}, {
      headers: getAuthHeader() 
    });
    if (response.status === 200) {
      // RSVP successful
      return response.data;
    } else {
      throw new Error(`Request failed with status code ${response.status}`);
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error('[rsvpToEvent] Error RSVPing to event: Event not found or invalid endpoint.');
      // Optionally, display a more user-friendly message in your frontend:
      throw new Error("Couldn't RSVP. The event was not found or there's a server issue.");
    } else {
      console.error('[rsvpToEvent] Unexpected error RSVPing to event:', error.message);
      throw error; // Re-throw for handling in the component
    }
  }
}

// Fetch Categories
export const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/events/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Fetch Countries
export const fetchCountries = async () => {
  try {
    const response = await axios.get('/api/events/countries');
    return response.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

// Fetch States
export const fetchStates = async (country) => {
  try {
    const response = await axios.get(`/api/events/states?country=${country}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching states:', error);
    throw error;
  }
};

// Fetch Cities
export const fetchCities = async (country, state) => {
  try {
    const response = await axios.get(`/api/events/cities?country=${country}&state=${state}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

// Handle Axios Errors
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
  fetchCategories,
  fetchCountries,
  fetchStates,
  fetchCities
};
