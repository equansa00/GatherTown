// utils/auth.js
export function getAuthHeader() {
  const token = localStorage.getItem('token'); // Or however you store your token
  if (token) {
    return { Authorization: `Bearer ${token}` };
  } else {
    return {}; 
  }
}
