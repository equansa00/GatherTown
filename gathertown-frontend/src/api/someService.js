// src/api/someService.js
import axios from 'axios';
import { getAuthHeader } from '../utils/authUtils';

export const fetchData = async () => {
  try {
    const response = await axios.get('/api/endpoint', {
      headers: getAuthHeader()
    });
    console.log(response.data);
  } catch (error) {
    console.error('API call error:', error);
  }
};

fetchData();
