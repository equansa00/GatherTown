import pymongo
from mapbox import Geocoder
import json

# Connect to MongoDB
mongo_uri = "mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority"
client = pymongo.MongoClient(mongo_uri)
db = client['event_database']
collection = db['events']

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
            collection.update_one(
                {'_id': event['_id']},
                {
                    "$set": {
                        "coordinates": location
                    }
                }
            )
            print(f"Updated event ID: {event['_id']}")
        else:
            print(f"No location found for event ID: {event['_id']}")
    else:
        print(f"Error {response.status_code} for event ID: {event['_id']}")

def filter_successful_events(events):
    # Filters out invalid events
    return [event for event in events if not is_invalid_event(event)]

def save_successful_events(original_file_path):
    # Load the original events file
    with open(original_file_path, 'r') as f:
        events = json.load(f)
    
    # Filter out invalid events
    successful_events = filter_successful_events(events)
    
    # Save only the successful events back to the original file
    with open(original_file_path, 'w') as f:
        json.dump(successful_events, f, indent=4)

if __name__ == "__main__":
    original_file_path = '/home/equansa00/Desktop/GatherTown/scripts/events.json'
    
    # Find and update invalid events in MongoDB
    invalid_events = collection.find({
        "$or": [
            {"city": {"$in": UNKNOWN_LOCATIONS}},
            {"state": {"$in": UNKNOWN_LOCATIONS}},
            {"zip_code": {"$in": INVALID_ZIP_CODES}},
            {"coordinates": {"$in": INVALID_COORDINATES}}
        ]
    })

    for event in invalid_events:
        update_event(event)

    # Filter and save successful events in the JSON file
    save_successful_events(original_file_path)
    print("Failed events removed and updated events.json with successful events.")
