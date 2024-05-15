import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const setAuthHeader = (token) => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const login = async (credentials) => {
  console.log('Attempting login with credentials:', credentials);
  try {
    const response = await axios.post(`${API_URL}/users/login`, credentials);
    console.log('Login response:', response.data);
    if (response.data && response.data.token) {
      setAuthHeader(response.data.token);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    console.error('Error during login request:', error);
    throw error;
  }
};

export const register = async (userData) => {
  console.log('Attempting registration with user data:', userData);
  try {
    const response = await axios.post(`${API_URL}/users/register`, userData);
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error during registration request:', error);
    throw error;
  }
};

// Function to refresh token
export const refreshToken = async () => {
  const token = localStorage.getItem('refreshToken');
  if (!token) {
    throw new Error('No refresh token available');
  }
  try {
    const response = await axios.post(`${API_URL}/users/refresh-token`, { token });
    if (response.data && response.data.token) {
      setAuthHeader(response.data.token);
      localStorage.setItem('token', response.data.token);
      return response.data.token;
    } else {
      throw new Error('Token refresh failed');
    }
  } catch (error) {
    console.error('Error during token refresh:', error);
    throw error;
  }
};

// Function to fetch events
export const fetchEvents = async () => {
  try {
    const response = await axios.get(`${API_URL}/events`);
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Function to get event details
export const getEventDetails = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/events/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event details:', error);
    throw error;
  }
};

// Function to submit a new event
export const submitEvent = async (eventData) => {
  try {
    const response = await axios.post(`${API_URL}/events`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error submitting event:', error);
    throw error;
  }
};
