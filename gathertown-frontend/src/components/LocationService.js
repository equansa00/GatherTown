// src/components/LocationService.js
function getLocation(successCallback, errorCallback) {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          position => {
              console.log("Latitude:", position.coords.latitude, "Longitude:", position.coords.longitude);
              successCallback(position);
          },
          error => {
              console.error("Geolocation error:", error);
              errorCallback(error);
          }
      );
  } else {
      console.error("Geolocation is not supported by this browser.");
      errorCallback(new Error("Geolocation is not supported by this browser."));
  }
}

function showPosition(position) {
  console.log("Latitude: " + position.coords.latitude + 
  "\nLongitude: " + position.coords.longitude);
}

function showError(error) {
  switch(error.code) {
      case error.PERMISSION_DENIED:
          console.error("User denied the request for Geolocation.");
          break;
      case error.POSITION_UNAVAILABLE:
          console.error("Location information is unavailable.");
          break;
      case error.TIMEOUT:
          console.error("The request to get user location timed out.");
          break;
      case error.UNKNOWN_ERROR:
          console.error("An unknown error occurred.");
          break;
  }
}

export { getLocation, showPosition, showError };
