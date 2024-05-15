// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService, register as registerService, refreshToken as refreshService } from '../api/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    console.log('Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('useEffect triggered. Token in localStorage:', token);
    if (token) {
      setUser({ token });
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const refreshToken = async () => {
      try {
        const newToken = await refreshService();
        setUser({ token: newToken });
        localStorage.setItem('token', newToken);
      } catch (error) {
        console.error('Error refreshing token:', error);
        logout();
      }
    };

    // Schedule token refresh based on expiration time
    if (token) {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      const timeUntilExpiry = exp - now;
      if (timeUntilExpiry > 0) {
        setTimeout(refreshToken, timeUntilExpiry * 1000);
      } else {
        refreshToken();
      }
    }
  }, [logout]);

  const login = async (email, password) => {
    console.log('Attempting login with email and password:', { email, password });
    try {
      const data = await loginService({ email, password });
      console.log('Login successful. User data:', data.user);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const register = async (email, password, username) => {
    console.log('Attempting registration with email, username, and password:', { email, username, password });
    try {
      const data = await registerService({ email, username, password });
      console.log('Registration successful. User data:', data.user);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
