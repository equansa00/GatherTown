import json
from mapbox import Geocoder

# Initialize Mapbox Geocoder
mapbox_token = 'pk.eyJ1IjoiZXF1YW5zYTAwIiwiYSI6ImNsd3BvMDZubjJzM24yanBwbDV6cmMzM2cifQ.D4NmR6jJ_G_qbDp22fl4gw'
geocoder = Geocoder(access_token=mapbox_token)

# List of invalid zip codes, city, state identifiers
INVALID_ZIP_CODES = ["00000"]
UNKNOWN_LOCATIONS = ["Unknown City", "Unknown State"]
INVALID_COORDINATES = [
    [8.519742, -69.3737415],
    [-104.06319, -33.6721515],
    # Add any other known invalid coordinates here
]

def is_invalid_event(event):
    # Checks if the event is invalid based on zip code, city, state, or coordinates
    return (
        event.get('zip_code') in INVALID_ZIP_CODES or
        event.get('city') in UNKNOWN_LOCATIONS or
        event.get('state') in UNKNOWN_LOCATIONS or
        event.get('coordinates') in INVALID_COORDINATES
    )

def reverse_geocode(coordinates):
    response = geocoder.reverse(lon=coordinates[0], lat=coordinates[1])
    if response.status_code == 200:
        data = response.json()
        if data['features']:
            place_name = data['features'][0]['place_name']
            return place_name
    return None

def update_event(event):
    place_name = reverse_geocode(event['coordinates'])
    if place_name:
        # Update the event with new location data
        location_data = place_name.split(', ')
        event['street'] = location_data[0] if len(location_data) > 0 else event['street']
        event['city'] = location_data[1] if len(location_data) > 1 else event['city']
        event['state'] = location_data[2] if len(location_data) > 2 else event['state']
        event['zip_code'] = location_data[3] if len(location_data) > 3 else event['zip_code']
        return True
    return False

def process_events(original_file_path):
    # Load the original events file
    with open(original_file_path, 'r') as f:
        events = json.load(f)
    
    total_events = len(events)
    invalid_events_count = 0
    fixed_events_count = 0
    unfixed_events_count = 0
    successful_events = []

    for event in events:
        if is_invalid_event(event):
            invalid_events_count += 1
            if update_event(event):
                fixed_events_count += 1
                successful_events.append(event)
            else:
                unfixed_events_count += 1
        else:
            successful_events.append(event)

    final_event_count = len(successful_events)

    # Save only the successful events back to the original file
    with open(original_file_path, 'w') as f:
        json.dump(successful_events, f, indent=4)
    
    print(f"Total number of events: {total_events}")
    print(f"Number of invalid events: {invalid_events_count}")
    print(f"Number of events fixed: {fixed_events_count}")
    print(f"Number of events that cannot be fixed: {unfixed_events_count}")
    print(f"Total number of events after updates: {final_event_count}")

if __name__ == "__main__":
    original_file_path = '/home/equansa00/Desktop/GatherTown/scripts/events.json'
    process_events(original_file_path)
