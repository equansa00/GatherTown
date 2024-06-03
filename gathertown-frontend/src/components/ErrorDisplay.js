import React from 'react';
import './ErrorDisplay.css';

function ErrorDisplay({ message }) {
  return (
    <div className="error-display">
      {/* distinct Style */}
      <p>{message}</p>
    </div>
  );
}

export default ErrorDisplay;
