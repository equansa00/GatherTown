import axios from 'axios';

console.log("REACT_APP_API_URL:", process.env.REACT_APP_API_URL);

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (request) => {
    console.log('Request:', {
      baseURL: request.baseURL,
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
