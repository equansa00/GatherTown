import json
import requests
from tqdm import tqdm

# Load events from JSON file
with open('/home/equansa00/Desktop/GatherTown/scripts/events.json', 'r') as f:
    events = json.load(f)

# Function to reverse geocode coordinates
def reverse_geocode(lat, lon):
    api_url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"
    response = requests.get(api_url)
    if response.status_code == 200:
        return response.json()
    return None

# Function to process events and update address information
def process_events(events):
    fixed_events = []
    invalid_events = []
    for event in tqdm(events, desc="Processing events"):
        coordinates = event.get('coordinates')
        if coordinates and len(coordinates) == 2:
            lat, lon = coordinates
            location_info = reverse_geocode(lat, lon)
            if location_info:
                address = location_info.get('address', {})
                city = address.get('city', address.get('town', address.get('village')))
                state = address.get('state')
                country = address.get('country')
                zip_code = address.get('postcode')
                
                if city and state and zip_code and country:
                    event['location'] = {
                        'city': city,
                        'state': state,
                        'country': country,
                        'zip_code': zip_code
                    }
                    fixed_events.append(event)
                else:
                    invalid_events.append(event)
            else:
                invalid_events.append(event)
        else:
            invalid_events.append(event)
    return fixed_events, invalid_events

# Process the events
fixed_events, invalid_events = process_events(events)

# Save the results to a new JSON file
results = {
    "Total number of events": len(events),
    "Number of fixed events": len(fixed_events),
    "Number of invalid events": len(invalid_events),
    "Fixed events": fixed_events,
    "Invalid events": invalid_events
}

with open('/home/equansa00/Desktop/GatherTown/scripts/events_results.json', 'w') as f:
    json.dump(results, f, indent=4)

print(f"Results saved to /home/equansa00/Desktop/GatherTown/scripts/events_results.json")
