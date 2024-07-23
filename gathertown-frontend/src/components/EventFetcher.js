// src/components/EventFetcher.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';

const EventFetcher = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEventbriteEvents = async () => {
      try {
        const response = await axios.get('https://www.eventbriteapi.com/v3/events/search/', {
          headers: {
            Authorization: `Bearer ${config.eventbriteApiKey}`
          },
          params: {
            location: 'New York',
            'location.within': '50km',
            page: 1
          }
        });
        console.log('Eventbrite Events:', response.data.events);
      } catch (error) {
        console.error('Error fetching Eventbrite events:', error);
      }
    };

    const fetchTicketmasterEvents = async () => {
      try {
        const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
          params: {
            apikey: config.ticketmasterApiKey,
            keyword: 'concert',
            size: 100,
            page: 0,
            locale: '*'
          }
        });
        console.log('Ticketmaster Events:', response.data._embedded.events);
      } catch (error) {
        console.error('Error fetching Ticketmaster events:', error);
      }
    };

    fetchEventbriteEvents();
    fetchTicketmasterEvents();
  }, []);

  return (
    <div>
      <h1>Fetched Events</h1>
      <ul>
        {events.map(event => (
          <li key={event.id}>{event.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default EventFetcher;
