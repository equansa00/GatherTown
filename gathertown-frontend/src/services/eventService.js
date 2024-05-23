// src/services/eventService.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/events'; 

axios.interceptors.request.use(request => {
  console.log('Starting Request', JSON.stringify(request, null, 2));
  return request;
});

axios.interceptors.response.use(response => {
  console.log('Response:', JSON.stringify(response, null, 2));
  return response;
}, error => {
  console.log('Error:', error.response);
  return Promise.reject(error);
});

async function fetchEventsBasedOnLocation(latitude, longitude) {
  const url = `${API_URL}/nearby?lat=${latitude}&lng=${longitude}`;
  try {
    const response = await axios.get(url);
    console.log('Response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
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
    throw error;
  }
}

export { fetchEventsBasedOnLocation };
