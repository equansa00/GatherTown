// utils/auth.js

// Example function to store token securely
export const storeToken = (token) => {
  localStorage.setItem('token', token);
};

// Example function to retrieve token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Example function to handle token expiration
export const isTokenExpired = (token) => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp < Date.now() / 1000;
};

// Function to get the authorization header with the stored token
export function getAuthHeader() {
  const token = getToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  } else {
    return {}; 
  }
}
