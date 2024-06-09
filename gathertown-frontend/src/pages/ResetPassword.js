// frontend/src/pages/ResetPassword.js
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('');
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
        password,
        confirmPassword,
      });
      setMessage(response.data.message || 'Password has been reset successfully. You can now login with your new password.');
      setError('');
    } catch (error) {
      console.error('Failed to reset password:', error);
      setMessage('');
      setError(error.response.data.message || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <label>
          New Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Confirm New Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Reset Password</button>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default ResetPassword;


