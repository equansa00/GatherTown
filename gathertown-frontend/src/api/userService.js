// src/api/userService.js
import axios from 'axios';
import config from '../config';

const API_URL = config.API_URL;

export const getUserProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await axios.get(`${API_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const changePassword = async (passwordData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await axios.put(`${API_URL}/users/change-password`, passwordData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const response = await axios.put(`${API_URL}/users/profile`, profileData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
