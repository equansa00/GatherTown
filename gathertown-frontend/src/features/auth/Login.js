//gathertown-frontend/src/features/auth/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { forgotPassword } from '../../api/authService'; // Ensure correct import path

const Login = () => {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      setError('User already logged in');
      return;
    }

    try {
      const response = await loginUser({ email, password });
      if (response.user) {
        navigate('/');
      } else {
        setError(response.message || 'Login failed. Please check your credentials and try again.');
        if (response.message && response.message.includes("Please register")) {
          navigate('/register');
        }
      }
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again later.');
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await forgotPassword(email);
      console.log('Forgot password response:', response);
      setForgotPasswordStatus('Password reset email sent. Please check your inbox.');
      setError('');
    } catch (error) {
      setError('Failed to send password reset email. Please try again.');
      setForgotPasswordStatus('');
    }
  };

  return (
    <div>
      {user ? (
        <p>You are already logged in as {user.username}</p>
      ) : (
        <>
          <h2>{isForgotPassword ? 'Forgot Password' : 'Login'}</h2>
          <form onSubmit={isForgotPassword ? handleForgotPasswordSubmit : handleLoginSubmit}>
            <label>
              Email:
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            {!isForgotPassword && (
              <label>
                Password:
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
            )}
            <button type="submit">{isForgotPassword ? 'Send Reset Link' : 'Login'}</button>
            {error && <p className="error">{error}</p>}
            {forgotPasswordStatus && <p className="success">{forgotPasswordStatus}</p>}
          </form>
          {!isForgotPassword ? (
            <p onClick={() => setIsForgotPassword(true)} style={{ cursor: 'pointer', color: 'blue' }}>
              Forgot password?
            </p>
          ) : (
            <p onClick={() => setIsForgotPassword(false)} style={{ cursor: 'pointer', color: 'blue' }}>
              Back to Login
            </p>
          )}
          <Link to="/register">Don't have an account? Sign up</Link>
        </>
      )}
    </div>
  );
};

export default Login;
