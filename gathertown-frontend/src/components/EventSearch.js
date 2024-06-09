import React, { useState, useEffect } from 'react';
import { fetchCategories, fetchCountries, fetchStates, fetchCities } from '../api/eventsService';

const EventSearch = ({ onSearch }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchCountries().then(setCountries);
  }, []);

  useEffect(() => {
    if (country) {
      fetchStates(country).then(setStates);
      setCities([]);
    } else {
      setStates([]);
      setCities([]);
    }
  }, [country]);

  useEffect(() => {
    if (country && state) {
      fetchCities(country, state).then(setCities);
    } else {
      setCities([]);
    }
  }, [country, state]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = { title, category, country, state, city, zip, startDate, endDate };
    console.log(`Search initiated with params: ${JSON.stringify(searchParams)}`);
    onSearch(searchParams);
  };

  return (
    <form onSubmit={handleSearch} className="event-search">
      <input
        type="text"
        placeholder="Search by title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <select value={country} onChange={(e) => setCountry(e.target.value)}>
        <option value="">Select Country</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
      {states.length > 0 && (
        <select value={state} onChange={(e) => setState(e.target.value)}>
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      )}
      {cities.length > 0 && (
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">Select City</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      )}
      <input
        type="text"
        placeholder="Search by Zip Code"
        value={zip}
        onChange={(e) => setZip(e.target.value)}
      />
      <input
        type="date"
        placeholder="Start Date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <input
        type="date"
        placeholder="End Date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default EventSearch;



// import React, { useState, useEffect } from 'react';
// import { fetchCategories, fetchCountries, fetchStates, fetchCities } from '../api/eventsService';

// const EventSearch = ({ onSearch }) => {
//   const [title, setTitle] = useState('');
//   const [category, setCategory] = useState('');
//   const [country, setCountry] = useState('');
//   const [state, setState] = useState('');
//   const [city, setCity] = useState('');
//   const [zipCode, setZipCode] = useState('');
//   const [categories, setCategories] = useState([]);
//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');

//   useEffect(() => {
//     fetchCategories().then(setCategories);
//     fetchCountries().then(setCountries);
//   }, []);

//   useEffect(() => {
//     if (country) {
//       fetchStates(country).then(setStates);
//       setCities([]);
//     } else {
//       setStates([]);
//       setCities([]);
//     }
//   }, [country]);

//   useEffect(() => {
//     if (country && state) {
//       fetchCities(country, state).then(setCities);
//     } else {
//       setCities([]);
//     }
//   }, [country, state]);

//   const handleSearch = (e) => {
//     e.preventDefault();
//     const searchParams = { title, category, country, state, city, zipCode, startDate, endDate };
//     console.log(`Search initiated with params: ${JSON.stringify(searchParams)}`);
//     onSearch(searchParams);
//   };

//   return (
//     <form onSubmit={handleSearch} className="event-search">
//       <input
//         type="text"
//         placeholder="Search by title"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//       />
//       <select value={category} onChange={(e) => setCategory(e.target.value)}>
//         <option value="">Select Category</option>
//         {categories.map((cat) => (
//           <option key={cat} value={cat}>
//             {cat}
//           </option>
//         ))}
//       </select>
//       <select value={country} onChange={(e) => setCountry(e.target.value)}>
//         <option value="">Select Country</option>
//         {countries.map((country) => (
//           <option key={country} value={country}>
//             {country}
//           </option>
//         ))}
//       </select>
//       {states.length > 0 && (
//         <select value={state} onChange={(e) => setState(e.target.value)}>
//           <option value="">Select State</option>
//           {states.map((state) => (
//             <option key={state} value={state}>
//               {state}
//             </option>
//           ))}
//         </select>
//       )}
//       {cities.length > 0 && (
//         <select value={city} onChange={(e) => setCity(e.target.value)}>
//           <option value="">Select City</option>
//           {cities.map((city) => (
//             <option key={city} value={city}>
//               {city}
//             </option>
//           ))}
//         </select>
//       )}
//       <input
//         type="text"
//         placeholder="Search by Zip Code"
//         value={zipCode}
//         onChange={(e) => setZipCode(e.target.value)}
//       />
//       <input
//         type="date"
//         placeholder="Start Date"
//         value={startDate}
//         onChange={(e) => setStartDate(e.target.value)}
//       />
//       <input
//         type="date"
//         placeholder="End Date"
//         value={endDate}
//         onChange={(e) => setEndDate(e.target.value)}
//       />
//       <button type="submit">Search</button>
//     </form>
//   );
// };

// export default EventSearch;
