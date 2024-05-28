// src/features/events/EventSearch.js
import React, { useState } from 'react';
import { fetchEvents } from '../../api/eventsService';

const EventSearch = ({ setEvents }) => {
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [limit, setLimit] = useState(10);

  const handleSearch = async () => {
    const events = await fetchEvents({ zip, city, state, limit });
    setEvents(events);
  };

  return (
    <div className="event-search">
      <input type="text" placeholder="Zip Code" value={zip} onChange={(e) => setZip(e.target.value)} />
      <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
      <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
      <select value={limit} onChange={(e) => setLimit(e.target.value)}>
        {[10, 20, 30, 40, 50].map(num => (
          <option key={num} value={num}>{num} events</option>
        ))}
      </select>
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default EventSearch;

