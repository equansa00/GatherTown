import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoryList from '../../components/CategoryList';
import CountryList from '../../components/CountryList';
import StateList from '../../components/StateList';
import EventList from '../../components/EventList';
import EventSearch from './EventSearch';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/events', {
          params: { category: selectedCategory, country: selectedCountry, state: selectedState }
        });
        setEvents(response.data.events);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [selectedCategory, selectedCountry, selectedState]);

  return (
    <div>
      <EventSearch onSearch={(params) => {
        setSelectedCategory(params.category);
        setSelectedCountry(params.country);
        setSelectedState(params.state);
      }} />
      <CategoryList onSelectCategory={setSelectedCategory} />
      <CountryList onSelectCountry={setSelectedCountry} />
      {selectedCountry && <StateList country={selectedCountry} onSelectState={setSelectedState} />}
      <EventList events={events} />
    </div>
  );
};

export default EventsPage;
