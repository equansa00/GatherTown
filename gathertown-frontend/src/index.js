// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App'; // Ensure this path is correct

function handleTouchStart(event) {
  const touch = event.touches[0];
  console.log(`Touch started at: (${touch.clientX}, ${touch.clientY})`);
}

function handleTouchMove(event) {
  const touch = event.touches[0];
  console.log(`Touch moved to: (${touch.clientX}, ${touch.clientY})`);
}

document.addEventListener('touchstart', handleTouchStart, { passive: true });
document.addEventListener('touchmove', handleTouchMove, { passive: true });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App apiKey={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN} />
    </ErrorBoundary>
  </React.StrictMode>
);
