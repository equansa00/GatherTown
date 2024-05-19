// src/services/eventService.js

import axios from 'axios';

function fetchEventsBasedOnLocation(latitude, longitude) {
  const url = `/api/events/nearby?lat=${latitude}&lng=${longitude}`;
  return axios.get(url);
}

export { fetchEventsBasedOnLocation };
