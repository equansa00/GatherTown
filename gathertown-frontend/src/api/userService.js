// src/api/userService.js
import axiosInstance from '../utils/axiosInstance';

export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.put('/users/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put('/users/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
