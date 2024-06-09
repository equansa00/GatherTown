// src/utils/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post('http://localhost:5000/api/users/refresh-token', {
          token: localStorage.getItem('refreshToken'),
        });
        localStorage.setItem('accessToken', data.accessToken);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error(err);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default axiosInstance;

