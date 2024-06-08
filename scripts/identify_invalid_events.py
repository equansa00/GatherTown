import pymongo

# Replace with your MongoDB URI and database name
mongo_uri = "mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority"  
database_name = "Local_Event_Finder_test"

def connect_to_mongo(uri, db_name):
    client = pymongo.MongoClient(uri)
    db = client[db_name]
    return db

def find_invalid_events(db):
    events_collection = db["events"]
    invalid_events = events_collection.find({
        "$or": [
            {"location.city": "Unknown City"},
            {"location.zipCode": "00000"},
            {"location.street": "Unknown Street"}
        ]
    })
    return list(invalid_events)

def print_invalid_events(events):
    for event in events:
        print(f"Invalid event ID: {event['_id']}")
        print(f"Title: {event['title']}")
        print(f"City: {event['location']['city']}")
        print(f"State: {event['location']['state']}")
        print(f"Zip Code: {event['location']['zipCode']}")
        print(f"Street: {event['location']['street']}")
        print(f"Coordinates: {event['location']['coordinates']}")
        print("-" * 50)

if __name__ == "__main__":
    db = connect_to_mongo(mongo_uri, database_name)
    invalid_events = find_invalid_events(db)
    print_invalid_events(invalid_events)
