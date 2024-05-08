import React, { useState } from 'react';

function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setCredentials({...credentials, [e.target.name    ]: e.target.value});
};

const handleSubmit = (e) => {
  e.preventDefault();
  // Implement the authentication API call here
  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Store the received JWT token in local storage or another secure place
        localStorage.setItem('token', data.token);
        // Redirect to the home or dashboard page, or refresh the current page
        window.location.href = '/';
      } else {
        alert('Login failed: ' + data.message);
      }
    })
    .catch(error => console.error('Error:', error));
};

return (
  <form onSubmit={handleSubmit}>
    <input
      type="text"
      name="username"
      value={credentials.username}
      onChange={handleChange}
      placeholder="Username"
    />
    <input
      type="password"
      name="password"
      value={credentials.password}
      onChange={handleChange}
      placeholder="Password"
    />
    <button type="submit">Login</button>
  </form>
);
}

export default LoginPage;

