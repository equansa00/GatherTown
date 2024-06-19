// src/api/authService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const setAuthHeader = (token) => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const login = async (userData) => {
  console.log('Attempting login with credentials:', userData);
  try {
    const response = await axios.post(`${API_URL}/users/login`, userData);
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

// Function for forgot password
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data; 
  } catch (error) {
    throw new Error('Failed to send password reset email.');
  }
};

// Function to reset password
export const resetPassword = async (token, password) => {
  return await axios.post(`${API_URL}/reset-password/${token}`, { password });
};

// Function to fetch user details
export const fetchUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await fetch('/api/user', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return response.json();
};
