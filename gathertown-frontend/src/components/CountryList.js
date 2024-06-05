// src/components/CountryList.js
import React from 'react';
import FilterList from './FilterList';
import { fetchCountries } from '../api/eventsService';

const CountryList = ({ onSelectCountry }) => {
  return <FilterList label="Countries" fetchFunction={fetchCountries} onSelect={onSelectCountry} optionValueField="code" optionLabelField="name" />;
};

export default CountryList;
