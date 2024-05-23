import axios from 'axios';

export const fetchAddress = async (lat, lng) => {
  try {
    console.log(`Fetching address for coordinates: (${lat}, ${lng})`);
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        latlng: `${lat},${lng}`,
        key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
      }
    });
    if (response.data.results && response.data.results[0]) {
      console.log('Address fetched:', response.data.results[0].formatted_address);
      return response.data.results[0].formatted_address;
    } else {
      console.log('No address found for coordinates:', { lat, lng });
      return 'Unknown Address';
    }
  } catch (error) {
    console.error('Error fetching address:', error);
    return 'Unknown Address';
  }
};
