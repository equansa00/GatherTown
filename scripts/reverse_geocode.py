import json
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

geolocator = Nominatim(user_agent="reverse_geocoder")
reverse = RateLimiter(geolocator.reverse, min_delay_seconds=1)

def reverse_geocode_events(file_path):
    with open(file_path, 'r') as f:
        events = json.load(f)
    
    for event in events:
        try:
            coordinates = event['location']['coordinates']
            location = reverse((coordinates[1], coordinates[0]))
            address_details = location.raw.get('address', {}) if location else {}
            
            event['location']['streetAddress'] = address_details.get('road', "Unknown Address")
            event['location']['city'] = address_details.get('city', address_details.get('town', "Unknown"))
            event['location']['state'] = address_details.get('state', address_details.get('county', "Unknown"))
            event['location']['country'] = address_details.get('country', "Unknown")
            event['location']['zipCode'] = address_details.get('postcode', "Unknown")
        except Exception as e:
            print(f"Error occurred while reverse geocoding coordinates {coordinates}: {e}")
    
    with open(file_path, 'w') as f:
        json.dump(events, f, indent=4)

reverse_geocode_events('/home/equansa00/Desktop/GatherTown/events.json')
print("Reverse geocoding completed and addresses updated in events.json.")
