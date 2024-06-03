import React, { useState, useEffect } from 'react';
import { fetchStates } from '../api/eventsService';

const StateList = ({ country, onSelectState }) => {
  const [states, setStates] = useState([]);

  useEffect(() => {
    if (country) {
      const fetchStateData = async () => {
        try {
          const stateData = await fetchStates(country);
          setStates(stateData);
        } catch (error) {
          console.error('Error fetching states:', error);
        }
      };

      fetchStateData();
    }
  }, [country]);

  return (
    <select onChange={(e) => onSelectState(e.target.value)}>
      <option value="">Select State</option>
      {states.map((state) => (
        <option key={state} value={state}>
          {state}
        </option>
      ))}
    </select>
  );
};

export default StateList;
