import React from 'react';
import './ErrorDisplay.css';

function ErrorDisplay({ message }) {
  return (
    <div className="error-display">
      {/* Style this as needed to make it visually distinct */}
      <p>{message}</p>
    </div>
  );
}

export default ErrorDisplay;
