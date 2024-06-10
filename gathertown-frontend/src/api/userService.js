import axios from 'axios';
import { getToken } from '../utils/auth';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/users';

// const getToken = () => localStorage.getItem('token');

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

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await axios.put(`${API_URL}/change-password`, {
      currentPassword,
      newPassword
    }, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error.response.data);
    throw error.response.data;
  }
};



// import axios from 'axios';

// const API_URL = '/api/users';

// const getToken = () => localStorage.getItem('token');

// export const getUserProfile = async () => {
//   const response = await axios.get(`${API_URL}/profile`, {
//     headers: {
//       Authorization: `Bearer ${getToken()}`,
//     },
//   });
//   return response.data;
// };

// export const updateUserProfile = async (profileData) => {
//   const response = await axios.put(`${API_URL}/profile`, profileData, {
//     headers: {
//       Authorization: `Bearer ${getToken()}`,
//     },
//   });
//   return response.data;
// };

// export const changePassword = async (currentPassword, newPassword, token) => {
//   try {
//       const response = await axios.put(`${API_URL}/users/change-password`, {
//           currentPassword,
//           newPassword
//       }, {
//           headers: {
//               Authorization: `Bearer ${token}`,
//               'Content-Type': 'application/json'
//           }
//       });
//       return response.data;
//   } catch (error) {
//       console.error('Error changing password:', error.response.data);
//       throw error.response.data;
//   }
// };