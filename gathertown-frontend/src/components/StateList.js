// src/components/StateList.js
import React from 'react';
import FilterList from './FilterList';
import { fetchStates } from '../api/eventsService';

const StateList = ({ country, onSelectState }) => {
  const fetchStatesForCountry = async () => {
    if (country) {
      return await fetchStates(country);
    }
    return [];
  };

  return <FilterList label="States" fetchFunction={fetchStatesForCountry} onSelect={onSelectState} optionValueField="code" optionLabelField="name" />;
};

export default StateList;
