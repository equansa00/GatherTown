import React from 'react';
import './LoadingSpinner.css'; 

function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      {/* customized the spinner appearance with CSS */}
      <div className="spinner"></div>
      <p>Loading events...</p> 
    </div>
  );
}

export default LoadingSpinner;
