// src/components/SomeComponent.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, isTokenExpired } from '../utils/authUtils';

const SomeComponent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      // Token is valid, proceed with authenticated operations
      console.log('Token is valid');
    } else {
      // Token is invalid or expired, redirect to login or take appropriate action
      console.log('Token is invalid or expired');
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div>
      {/* Your component content */}
    </div>
  );
};

export default SomeComponent;
