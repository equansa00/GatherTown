import axios from 'axios';
import { getAuthHeader } from '../utils/auth';

const logMessage = (message) => {
  console.log(`[eventsService] ${message}`);
};

// Logging all requests and responses
axios.interceptors.request.use(request => {
  // console.log('Starting Request', JSON.stringify(request, null, 2));
  return request;
});

axios.interceptors.response.use(response => {
  // console.log('Response:', JSON.stringify(response, null, 2));
  return response;
}, error => {
  console.log('Error:', error.response ? JSON.stringify(error.response, null, 2) : error.message);
  return Promise.reject(error);
});

const API_URL = 'http://localhost:5000/api/events';

export const fetchRandomEvents = async (count = 5) => {
  try {
    const response = await axios.get(`${API_URL}/random`, {
      params: { count }
    });
    return response.data;
  } catch (error) {
    throw new Error('Error fetching random events');
  }
};

export const fetchEvents = async (params) => {
  try {
    logMessage(`Fetching events with params: ${JSON.stringify(params)}`);
    const response = await axios.get(API_URL, { params });
    logMessage(`Fetched ${response.data.length} events`);
    return response.data;
  } catch (error) {
    logMessage(`Error fetching events: ${error.message}`);
    throw error;
  }
};

export const fetchAllEvents = async (params = {}) => { // Default to empty object if no params
  try {
    const response = await axios.get(`${API_URL}/all`, { params, headers: getAuthHeader() });
    console.log('fetchAllEvents response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching all events:', error);
    throw new Error('Error fetching all events');
  }
};

export const fetchEventsByZip = async (zipCode, page = 0) => {
  const url = `${API_URL}/by-zip`;
  console.log(`Fetching events by zip code: ${zipCode}, page: ${page}`);
  
  try {
    const response = await axios.get(url, {
      headers: getAuthHeader(),
      params: { zipCode, page }
    });
    console.log('fetchEventsByZip response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching events by zip:', error);
    handleAxiosError(error);
    throw error;
  }
};

export const addEvent = async (eventData) => {
  console.log("Adding event:", eventData);
  try {
    const response = await axios.post(API_URL, eventData, { headers: getAuthHeader() });
    console.log('Event added successfully:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error adding event:', error);
    handleAxiosError(error);
    throw error;
  }
};

export const getEventDetails = async (id) => {
  console.log(`Fetching event details for ID: ${id}`);
  try {
    const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
    console.log('Event details fetched successfully:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error fetching event details:', error);
    handleAxiosError(error);
    throw error;
  }
};

export const updateEvent = async (id, eventData) => {
  console.log(`Updating event ID: ${id}`, eventData);
  try {
    const response = await axios.put(`${API_URL}/${id}`, eventData, { headers: getAuthHeader() });
    console.log('Event updated successfully:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    handleAxiosError(error);
    throw error;
  }
};

export const deleteEvent = async (id) => {
  console.log(`Deleting event ID: ${id}`);
  try {
    const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
    console.log('Event deleted successfully:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    handleAxiosError(error);
    throw error;
  }
};

export const rsvpToEvent = async (eventId) => {
  console.log(`RSVPing to event ID: ${eventId}`);
  try {
    const response = await axios.post(`${API_URL}/${eventId}/rsvp`, {}, { headers: getAuthHeader() });
    console.log('RSVP successful:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error RSVPing to event:', error);
    handleAxiosError(error);
    throw error;
  }
};

const handleAxiosError = (error) => {
  if (error.response) {
    console.error('Error response:', {
      data: error.response.data,
      status: error.response.status,
      headers: error.response.headers,
    });
  } else if (error.request) {
    console.error('No response received:', error.request);
  } else {
    console.error('Error setting up request:', error.message);
  }
};

const getEvents = (lat, lng, page = 0) => {
  return axios.get(API_URL, {
    params: {
      lat,
      lng,
      page
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
};

export default { getEvents };
