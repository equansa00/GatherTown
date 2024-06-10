import axios from 'axios';

const API_URL = '/api/users';

const getToken = () => localStorage.getItem('token');

export const getUserProfile = async () => {
  const response = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await axios.put(`${API_URL}/profile`, profileData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await axios.put(`${API_URL}/change-password`, passwordData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  return response.data;
};
