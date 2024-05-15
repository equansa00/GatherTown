
import axios from 'axios';

const API_BASE_URL = '/api'; // Adjust as necessary

export const fetchEvents = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/events');
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    console.log(data); // Check the data received
    return data;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
    return []; // Return an empty array or handle the error appropriately
  }
};
export const submitEvent = async (eventData, token) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    const response = await axios.post(`${API_BASE_URL}/events`, eventData, config);
    return response.data;
  } catch (error) {
    console.error("Error submitting event:", error);
    throw error; // Allow frontend to handle the error specifically
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error; // Allow frontend to handle specific errors
  }
};




// export const submitEvent = async (eventData, token) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/events`, eventData, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error submitting event:", error);
//     throw error;
//   }
// };
