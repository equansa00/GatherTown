//backend/utils/geocode.js
const axios = require('axios');

const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`, {
      params: {
        access_token: process.env.MAPBOX_ACCESS_TOKEN,
        limit: 1
      }
    });
    const data = response.data;
    if (data.features.length > 0) {
      const location = data.features[0].geometry;
      return { lat: location.coordinates[1], lng: location.coordinates[0] };
    } else {
      throw new Error('No location found');
    }
  } catch (error) {
    throw new Error(`Error geocoding address: ${error.message}`);
  }
};

module.exports = { geocodeAddress };

