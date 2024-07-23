// src/config.js

const API_URL = 'http://localhost:5000/api';

const config = {
  API_URL,
  eventbriteApiKey: process.env.REACT_APP_EVENTBRITE_API_KEY,
  ticketmasterApiKey: process.env.REACT_APP_TICKETMASTER_API_KEY,
  mapboxAccessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
  unsplashAccessKey: process.env.REACT_APP_UNSPLASH_ACCESS_KEY,
  cloudinary: {
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.REACT_APP_CLOUDINARY_API_KEY,
    apiSecret: process.env.REACT_APP_CLOUDINARY_API_SECRET,
  }
};

export default config;
