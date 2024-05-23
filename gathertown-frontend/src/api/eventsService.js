import axios from 'axios';

const API_URL = 'http://localhost:5000/api/events'; 

// Logging all requests and responses
axios.interceptors.request.use(request => {
  // console.log('Starting Request', JSON.stringify(request, null, 2));
  return request;
});

axios.interceptors.response.use(response => {
  // console.log('Response:', JSON.stringify(response, null, 2));
  return response;
}, error => {
  console.log('Error:', error.response);
  return Promise.reject(error);
});

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const fetchEvents = async (latitude, longitude, distance = 10000) => {
  const url = `${API_URL}/nearby`; 
  const params = { lat: latitude, lng: longitude, distance };
  console.log(`Fetching events at lat: ${latitude}, long: ${longitude} within ${distance} meters`);
  console.log("Request URL:", url); 
  console.log("Request Parameters:", params); 

  try {
    const response = await axios.get(url, {
      headers: getAuthHeader(),
      params
    });
    console.log("Events fetched successfully", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const fetchEventsByZip = async (zipCode) => {
  console.log(`Fetching events by zip code: ${zipCode}`);
  const url = `${API_URL}/byZip`;
  const params = { zip: zipCode };
  console.log("Request URL:", url);
  console.log("Request Parameters:", params);

  try {
    const response = await axios.get(url, {
      headers: getAuthHeader(),
      params
    });
    console.log("Events by zip fetched successfully", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching events by zip code:', error);
    throw error;
  }
};

export const addEvent = async (eventData) => {
  console.log("Adding event:", eventData);
  try {
    const response = await axios.post(`${API_URL}`, eventData, { headers: getAuthHeader() });
    console.log("Event added successfully", response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding event:', error);
    throw error;
  }
};

export const getEventDetails = async (id) => {
  console.log(`Fetching event details for ID: ${id}`);
  try {
    const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
    console.log("Event details fetched successfully", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching event details:', error);
    throw error;
  }
};

export const submitEvent = async (eventData) => {
  console.log("Submitting event:", eventData);
  try {
    const response = await axios.post(API_URL, eventData, { headers: getAuthHeader() });
    console.log("Event submitted successfully", response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting event:', error);
    throw error;
  }
};

export const updateEvent = async (id, eventData) => {
  console.log(`Updating event ID: ${id}`, eventData);
  try {
    const response = await axios.put(`${API_URL}/${id}`, eventData, { headers: getAuthHeader() });
    console.log("Event updated successfully", response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteEvent = async (id) => {
  console.log(`Deleting event ID: ${id}`);
  try {
    const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
    console.log("Event deleted successfully", response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export const rsvpToEvent = async (eventId) => {
  console.log(`RSVPing to event ID: ${eventId}`);
  try {
    const response = await axios.post(`${API_URL}/${eventId}/rsvp`, {}, { headers: getAuthHeader() });
    console.log("RSVP successful", response.data);
    return response.data;
  } catch (error) {
    console.error('Error RSVPing to event:', error);
    throw error;
  }
};
