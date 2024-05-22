//gathertown-frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App'; // Ensure this path is correct

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} />
    </ErrorBoundary>
  </React.StrictMode>
);
