// src/components/FilterList.js
import React, { useState, useEffect } from 'react';

const FilterList = ({ label, fetchFunction, onSelect, initialValue = '', optionValueField = 'value', optionLabelField = 'label' }) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await fetchFunction();
        setOptions(data);
      } catch (error) {
        console.error(`Error fetching ${label}:`, error);
      }
    };

    fetchOptions();
  }, [fetchFunction, label]);

  return (
    <div>
      <h3>{label}</h3>
      <select onChange={(e) => onSelect(e.target.value)} value={initialValue}>
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option[optionValueField]} value={option[optionValueField]}>
            {option[optionLabelField]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterList;
