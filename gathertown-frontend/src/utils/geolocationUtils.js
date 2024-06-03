// src/utils/geolocationUtils.js
import axios from 'axios';

export const fetchAddress = async (lat, lng) => {
  try {
    const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`, {
      params: {
        access_token: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
      },
    });

    let address = 'Unknown Address';
    if (response.data.features.length > 0) {
      address = response.data.features[0].place_name;
    }
    console.log(`Fetched address: ${address}`);
    return address;
  } catch (error) {
    console.error('Error fetching address:', error);
    return 'Unknown Address';
  }
};

const deg2rad = (deg) => deg * (Math.PI / 180);

export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon1 - lon2);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
};

export const getDistanceFromLatLonInMiles = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Radius of the earth in miles
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon1 - lon2);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
};

export const fetchAddressWithCache = (() => {
  const addressCache = {};

  return async (lat, lng) => {
    const cacheKey = `${lat},${lng}`;
    if (addressCache[cacheKey]) {
      return addressCache[cacheKey];
    }
    const address = await fetchAddress(lat, lng);
    addressCache[cacheKey] = address;
    return address;
  };
})();
