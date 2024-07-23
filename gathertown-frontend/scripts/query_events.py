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

def update_event(event):
    response = geocoder.forward(f"{event['street']}, {event['city']}, {event['state']}, {event['zip_code']}")
    if response.status_code == 200:
        data = response.json()
        if data['features']:
            location = data['features'][0]['geometry']['coordinates']
            event['coordinates'] = location
            return True
        else:
            return False
    else:
        return False

def process_events(original_file_path, output_file_path):
    # Load the original events file
    with open(original_file_path, 'r') as f:
        events = json.load(f)
    
    total_events = len(events)
    invalid_events = [event for event in events if is_invalid_event(event)]

    invalid_events_count = len(invalid_events)
    fixed_events_count = 0
    unfixed_events_count = 0
    successful_events = []

    for event in invalid_events:
        if update_event(event):
            fixed_events_count += 1
            successful_events.append(event)
        else:
            unfixed_events_count += 1
    
    results = {
        "Total number of events": total_events,
        "Number of invalid events": invalid_events_count,
        "Number of events fixed": fixed_events_count,
        "Number of events that cannot be fixed": unfixed_events_count,
        "Invalid events": invalid_events,
        "Fixed events": successful_events
    }

    # Save the results to a new file
    with open(output_file_path, 'w') as f:
        json.dump(results, f, indent=4)
    
    print(f"Results saved to {output_file_path}")

if __name__ == "__main__":
    original_file_path = '/home/equansa00/Desktop/GatherTown/scripts/events.json'
    output_file_path = '/home/equansa00/Desktop/GatherTown/scripts/events_results.json'
    process_events(original_file_path, output_file_path)
