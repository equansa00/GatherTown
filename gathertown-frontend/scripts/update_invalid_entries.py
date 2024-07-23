import pymongo
from mapbox import Geocoder

# Connect to MongoDB
mongo_uri = "mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority"
client = pymongo.MongoClient(mongo_uri)
db = client['event_database']
collection = db['events']

# Initialize Mapbox Geocoder
mapbox_token = 'pk.eyJ1IjoiZXF1YW5zYTAwIiwiYSI6ImNsd3BvMDZubjJzM24yanBwbDV6cmMzM2cifQ.D4NmR6jJ_G_qbDp22fl4gw'  # Replace with your Mapbox access token
geocoder = Geocoder(access_token=mapbox_token)

# Function to update an event
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

# Find invalid events
invalid_events = collection.find({
    "$or": [
        {"city": {"$in": ["Unknown City"]}},
        {"state": {"$in": ["Unknown State"]}},
        {"zip_code": "00000"},
        {"coordinates": {"$in": [[0, 0]]}}
    ]
})

# Update invalid events
for event in invalid_events:
    update_event(event)

print("Finished updating events.")
