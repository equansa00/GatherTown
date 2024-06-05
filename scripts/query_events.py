import pymongo
from bson.objectid import ObjectId

# Replace with your MongoDB URI and database name
mongo_uri = "mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority"  
database_name = "Local_Event_Finder_test"

def connect_to_mongo(uri, db_name):
    client = pymongo.MongoClient(uri)
    db = client[db_name]
    return db

def query_by_id(db, event_id):
    events_collection = db["events"]
    event = events_collection.find_one({"_id": ObjectId(event_id)})
    return event

def query_by_address(db, address):
    events_collection = db["events"]
    events = events_collection.find({"location.address": address})
    return events

def query_by_parameters(db, query):
    events_collection = db["events"]
    events = events_collection.find(query)
    return events

if __name__ == "__main__":
    db = connect_to_mongo(mongo_uri, database_name)
    
    # Example: Query by ID
    event_id = "605c72efee7a0c35a8d5a123"  # Replace with actual event ID
    event = query_by_id(db, event_id)
    print("Event by ID:", event)
    
    # Example: Query by Address
    address = "New York, New York, United States"  # Replace with actual address
    events = query_by_address(db, address)
    print("Events by Address:")
    for event in events:
        print(event)
    
    # Example: Query by Multiple Parameters
    query = {
        "location.city": "New York",
        "category": "Sports",
        "demographics.ageGroup": "55+"
    }
    events = query_by_parameters(db, query)
    print("Events by Parameters:")
    for event in events:
        print(event)
