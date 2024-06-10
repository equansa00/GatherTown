///home/equansa00/Desktop/GatherTown/gathertown-frontend/src/utils/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adding interceptors for logging requests and responses
axiosInstance.interceptors.request.use(
  (request) => {
    console.log('Request:', {
      url: request.url,
      method: request.method,
      headers: request.headers,
      params: request.params,
      data: request.data,
    });
    return request;
  },
  (error) => {
    console.error('Request Error:', error.message);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Error Response:', {
        url: error.response.config.url,
        method: error.response.config.method,
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('No Response Received:', error.request);
    } else {
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

