// src/features/events/EventSearch.js
import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash';

const EventSearch = ({ setSearchParams }) => {
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [limit, setLimit] = useState(10);

  const handleSearch = debounce(() => {
    setSearchParams({ zip, city, state, keyword, startDate, endDate, limit });
  }, 300);

  useEffect(() => {
    handleSearch();
  }, [zip, city, state, keyword, startDate, endDate, limit]);

  return (
    <div className="event-search">
      <input type="text" placeholder="Zip code" value={zip} onChange={(e) => setZip(e.target.value)} />
      <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
      <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
      <input type="text" placeholder="Keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      <input type="date" placeholder="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <input type="date" placeholder="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      <select value={limit} onChange={(e) => setLimit(parseInt(e.target.value, 10))}>
        {[10, 20, 30, 40, 50].map(num => (
          <option key={num} value={num}>{num} events</option>
        ))}
      </select>
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default EventSearch;
