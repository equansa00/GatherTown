// utils/auth.js
export function getAuthHeader() {
  const token = localStorage.getItem('token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  } else {
    return {}; 
  }
}

export const getToken = () => localStorage.getItem('token');
