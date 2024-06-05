// src/components/CategoryList.js
import React from 'react';
import FilterList from './FilterList';
import { fetchCategories } from '../api/eventsService';

const CategoryList = ({ onSelectCategory }) => {
  return <FilterList label="Categories" fetchFunction={fetchCategories} onSelect={onSelectCategory} optionValueField="id" optionLabelField="name" />;
};

export default CategoryList;
