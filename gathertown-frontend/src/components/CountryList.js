import React, { useState, useEffect } from 'react';
import { fetchCountries } from '../api/eventsService';

const CountryList = ({ onSelectCountry }) => {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        const countryData = await fetchCountries();
        setCountries(countryData);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    fetchCountryData();
  }, []);

  return (
    <select onChange={(e) => onSelectCountry(e.target.value)}>
      <option value="">Select Country</option>
      {countries.map((country) => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>
  );
};

export default CountryList;
