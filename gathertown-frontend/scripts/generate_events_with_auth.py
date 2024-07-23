#gathertown-frontend/scripts/generate_events_with_auth.py
import logging
import requests
from ratelimit import limits, sleep_and_retry
from pymongo import MongoClient, errors
from mapbox import Geocoder

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# MongoDB Configuration
MONGO_URI = "mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client["Local_Event_Finder_test"]
events_collection = db["events"]

# Ensure the unique index exists
index_name = "title_1_date_1_location.coordinates_1"
if index_name not in events_collection.index_information():
    events_collection.create_index([
        ("title", 1),
        ("date", 1),
        ("location.coordinates", "2dsphere")
    ], unique=True, name=index_name)
    logging.info("Unique compound index created successfully.")

# Hardcoded API keys
EVENTBRITE_API_KEY = "QGGXFUGQNGBOVCFDXNLE"
TICKETMASTER_CONSUMER_KEY = "1W3s5cOBvfYIgUWO2rBSK3rp3QBF9IGG"
MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiZXF1YW5zYTAwIiwiYSI6ImNsd3BvMDZubjJzM24yanBwbDV6cmMzM2cifQ.D4NmR6jJ_G_qbDp22fl4gw"

# Validate API keys
if not EVENTBRITE_API_KEY:
    logging.error("Eventbrite API key is missing. Please set it in the .env file.")
    exit(1)

if not TICKETMASTER_CONSUMER_KEY:
    logging.error("Ticketmaster API key is missing. Please set it in the .env file.")
    exit(1)

# Function to authenticate Eventbrite API
def authenticate_eventbrite_api():
    base_url = "https://www.eventbriteapi.com/v3/users/me/"
    headers = {"Authorization": f"Bearer {EVENTBRITE_API_KEY}"}
    
    try:
        response = requests.get(base_url, headers=headers)
        response.raise_for_status()
        logging.debug(f"Eventbrite authentication response: {response.text}")
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error authenticating with Eventbrite API: {e.response.text}")
        return None

# Fetch events from Eventbrite
@sleep_and_retry
@limits(calls=10, period=60)  # Adjust based on the API limits
def fetch_events_from_eventbrite(location="New York", within="50km", page=1):
    base_url = "https://www.eventbriteapi.com/v3/events/search/"
    headers = {"Authorization": f"Bearer {EVENTBRITE_API_KEY}"}
    params = {
        "location.address": location,
        "location.within": within,
        "page": page,
        "expand": "venue"
    }
    
    try:
        logging.debug(f"Eventbrite request headers: {headers}")
        logging.debug(f"Eventbrite request params: {params}")
        response = requests.get(base_url, headers=headers, params=params)
        response.raise_for_status()
        logging.debug(f"Eventbrite response: {response.text}")
        events = response.json().get('events', [])
        pagination = response.json().get('pagination', {})
        return events, pagination
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching events from Eventbrite: {e.response.text}")
        return [], {}

# Fetch events from Ticketmaster
@sleep_and_retry
@limits(calls=10, period=60)  # Adjust based on the API limits
def fetch_events_from_ticketmaster(keyword="concert", size=5, page=0):
    base_url = "https://app.ticketmaster.com/discovery/v2/events.json"
    params = {
        "apikey": TICKETMASTER_CONSUMER_KEY,
        "keyword": keyword,
        "size": size,
        "page": page,
        "locale": '*'  # Fetch events from all locales
    }

    try:
        logging.debug(f"Ticketmaster request params: {params}")
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        logging.debug(f"Ticketmaster response: {response.text}")

        events = response.json().get("_embedded", {}).get("events", [])
        pagination = response.json().get("page", {})
        return events, pagination

    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching events from Ticketmaster: {e.response.text}")
        return [], {}

def extract_eventbrite_details(event_data):
    try:
        venue = event_data.get("venue", {})
        location_data = {
            "type": "Point",
            "coordinates": [float(venue.get("longitude", 0)), float(venue.get("latitude", 0))]
        }
        address_data = {
            "name": venue.get("name", "Unknown Venue"),
            "street": venue.get("address", {}).get("localized_address_display", "Unknown Address")
        }
        event_details = {
            "title": event_data.get("name", {}).get("text", "No Title"),
            "description": event_data.get("description", {}).get("text", ""),
            "date": event_data.get("start", {}).get("utc", ""),
            "location": location_data,
            "address": address_data,
            "category": event_data.get("category", {}).get("name", "General"),
            "url": event_data.get("url", "")
        }
        return event_details
    except KeyError as e:
        logging.error(f"Missing key when extracting Eventbrite details: {e}")
        return None

def extract_ticketmaster_details(event_data):
    try:
        venue = event_data.get("_embedded", {}).get("venues", [{}])[0]
        location_data = venue.get("location", {})
        event_details = {
            "title": event_data.get("name", "No Title"),
            "description": event_data.get("info", ""),
            "date": event_data.get("dates", {}).get("start", {}).get("dateTime", ""),
            "location": {
                "type": "Point",
                "coordinates": [float(location_data.get("longitude", 0)), float(location_data.get("latitude", 0))]
            },
            "address": {
                "name": venue.get("name", "Unknown Venue"),
                "street": venue.get("address", {}).get("line1", "Unknown Address")
            },
            "category": event_data.get("classifications", [{}])[0].get("segment", {}).get("name", "General"),
            "url": event_data.get("url", "")
        }
        return event_details
    except KeyError as e:
        logging.error(f"Missing key when extracting Ticketmaster details: {e}")
        return None

def geocode_location(location_name):
    geocoder = Geocoder(access_token=MAPBOX_ACCESS_TOKEN)
    response = geocoder.forward(location_name).geojson()
    features = response['features']
    if features:
        coordinates = features[0]['geometry']['coordinates']
        return coordinates
    else:
        return [0.0, 0.0]

def save_event_to_mongo(event_details):
    try:
        result = events_collection.update_one(
            {
                "title": event_details["title"],
                "date": event_details["date"],
                "location.coordinates": event_details["location"]["coordinates"]
            },
            {"$set": event_details},
            upsert=True
        )
        if result.upserted_id:
            logging.info(f"Event saved to MongoDB with ID: {result.upserted_id}")
        else:
            logging.info(f"Event updated in MongoDB")
    except errors.PyMongoError as e:
        logging.error(f"Error saving event to MongoDB: {e}")

def fetch_and_store_events():
    locations = ["New York"]  # Limiting to New York for simplicity
    keywords = ["concert"]  # Limiting to concerts for simplicity

    event_count = 0

    for location in locations:
        eventbrite_events, _ = fetch_events_from_eventbrite(location=location)
        for event_data in eventbrite_events:
            event_details = extract_eventbrite_details(event_data)
            if event_details and event_details['location']['coordinates'] == [0.0, 0.0]:
                event_details['location']['coordinates'] = geocode_location(location)
            if event_details:
                save_event_to_mongo(event_details)
                event_count += 1
                if event_count >= 5:
                    return

        ticketmaster_events, _ = fetch_events_from_ticketmaster()
        for event_data in ticketmaster_events:
            event_details = extract_ticketmaster_details(event_data)
            if event_details and event_details['location']['coordinates'] == [0.0, 0.0]:
                event_details['location']['coordinates'] = geocode_location(location)
            if event_details:
                save_event_to_mongo(event_details)
                event_count += 1
                if event_count >= 5:
                    return

# Main execution
if __name__ == "__main__":
    user_info = authenticate_eventbrite_api()
    if user_info:
        logging.info(f"Authenticated successfully: {user_info}")
        fetch_and_store_events()
        logging.info("Event generation and storage complete.")
    else:
        logging.error("Failed to authenticate with Eventbrite API.")




















# import logging
# import requests
# from ratelimit import limits, sleep_and_retry
# from pymongo import MongoClient, errors
# from mapbox import Geocoder

# # Configure logging
# logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# # MongoDB Configuration
# MONGO_URI = "mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority"
# client = MongoClient(MONGO_URI)
# db = client["Local_Event_Finder_test"]
# events_collection = db["events"]

# # Ensure the unique index exists
# index_name = "title_1_date_1_location.coordinates_1"
# if index_name not in events_collection.index_information():
#     events_collection.create_index([
#         ("title", 1),
#         ("date", 1),
#         ("location.coordinates", "2dsphere")
#     ], unique=True, name=index_name)
#     logging.info("Unique compound index created successfully.")

# # Hardcoded API keys
# EVENTBRITE_API_KEY = "QGGXFUGQNGBOVCFDXNLE"
# EVENTBRITE_CLIENT_SECRET = "SEKFNUP4F2DH3X6VHHEUI5SBP1FHLRNLGZADLG4XPBDIJ3MDT"
# TICKETMASTER_CONSUMER_KEY = "1W3s5cOBvfYIgUWO2rBSK3rp3QBF9IGG"
# TICKETMASTER_CONSUMER_SECRET = "oAX16YzvlGdb3cnc"
# MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiZXF1YW5zYTAwIiwiYSI6ImNsd3BvMDZubjJzM24yanBwbDV6cmMzM2cifQ.D4NmR6jJ_G_qbDp22fl4gw"

# # Validate API keys
# if not EVENTBRITE_API_KEY:
#     logging.error("Eventbrite API key is missing. Please set it in the .env file.")
#     exit(1)

# if not TICKETMASTER_CONSUMER_KEY:
#     logging.error("Ticketmaster API key is missing. Please set it in the .env file.")
#     exit(1)

# def authenticate_eventbrite_api():
#     base_url = "https://www.eventbriteapi.com/v3/users/me/"
#     headers = {"Authorization": f"Bearer {EVENTBRITE_API_KEY}"}
    
#     try:
#         response = requests.get(base_url, headers=headers)
#         response.raise_for_status()
#         logging.debug(f"Eventbrite authentication response: {response.text}")
#         return response.json()
#     except requests.exceptions.RequestException as e:
#         logging.error(f"Error authenticating with Eventbrite API: {e.response.text}")
#         return None

# # Fetch events from Eventbrite
# @sleep_and_retry
# @limits(calls=10, period=60)  # Adjust based on the API limits
# def fetch_events_from_eventbrite(location="New York", within="50km", page=1):
#     base_url = "https://www.eventbriteapi.com/v3/events/search/"
#     headers = {"Authorization": f"Bearer {EVENTBRITE_API_KEY}"}
#     params = {
#         "location.address": location,
#         "location.within": within,
#         "page": page,
#         "expand": "venue"
#     }
    
#     try:
#         logging.debug(f"Eventbrite request headers: {headers}")
#         logging.debug(f"Eventbrite request params: {params}")
#         response = requests.get(base_url, headers=headers, params=params)
#         response.raise_for_status()
#         logging.debug(f"Eventbrite response: {response.text}")
#         events = response.json().get('events', [])
#         pagination = response.json().get('pagination', {})
#         return events, pagination
#     except requests.exceptions.RequestException as e:
#         logging.error(f"Error fetching events from Eventbrite: {e.response.text}")
#         return [], {}

# # Fetch events from Ticketmaster
# @sleep_and_retry
# @limits(calls=10, period=60)  # Adjust based on the API limits
# def fetch_events_from_ticketmaster(keyword="concert", size=5, page=0):
#     base_url = "https://app.ticketmaster.com/discovery/v2/events.json"
#     params = {
#         "apikey": TICKETMASTER_CONSUMER_KEY,
#         "keyword": keyword,
#         "size": size,
#         "page": page,
#         "locale": '*'  # Fetch events from all locales
#     }

#     try:
#         logging.debug(f"Ticketmaster request params: {params}")
#         response = requests.get(base_url, params=params)
#         response.raise_for_status()
#         logging.debug(f"Ticketmaster response: {response.text}")

#         events = response.json().get("_embedded", {}).get("events", [])
#         pagination = response.json().get("page", {})
#         return events, pagination

#     except requests.exceptions.RequestException as e:
#         logging.error(f"Error fetching events from Ticketmaster: {e.response.text}")
#         return [], {}

# def extract_eventbrite_details(event_data):
#     try:
#         venue = event_data.get("venue", {})
#         location_data = {
#             "type": "Point",
#             "coordinates": [float(venue.get("longitude", 0)), float(venue.get("latitude", 0))]
#         }
#         address_data = {
#             "name": venue.get("name", "Unknown Venue"),
#             "street": venue.get("address", {}).get("localized_address_display", "Unknown Address")
#         }
#         event_details = {
#             "title": event_data.get("name", {}).get("text", "No Title"),
#             "description": event_data.get("description", {}).get("text", ""),
#             "date": event_data.get("start", {}).get("utc", ""),
#             "location": location_data,
#             "address": address_data,
#             "category": event_data.get("category", {}).get("name", "General"),
#             "url": event_data.get("url", "")
#         }
#         return event_details
#     except KeyError as e:
#         logging.error(f"Missing key when extracting Eventbrite details: {e}")
#         return None

# def extract_ticketmaster_details(event_data):
#     try:
#         venue = event_data.get("_embedded", {}).get("venues", [{}])[0]
#         location_data = venue.get("location", {})
#         event_details = {
#             "title": event_data.get("name", "No Title"),
#             "description": event_data.get("info", ""),
#             "date": event_data.get("dates", {}).get("start", {}).get("dateTime", ""),
#             "location": {
#                 "type": "Point",
#                 "coordinates": [float(location_data.get("longitude", 0)), float(location_data.get("latitude", 0))]
#             },
#             "address": {
#                 "name": venue.get("name", "Unknown Venue"),
#                 "street": venue.get("address", {}).get("line1", "Unknown Address")
#             },
#             "category": event_data.get("classifications", [{}])[0].get("segment", {}).get("name", "General"),
#             "url": event_data.get("url", "")
#         }
#         return event_details
#     except KeyError as e:
#         logging.error(f"Missing key when extracting Ticketmaster details: {e}")
#         return None

# def geocode_location(location_name):
#     geocoder = Geocoder(access_token=MAPBOX_ACCESS_TOKEN)
#     response = geocoder.forward(location_name).geojson()
#     features = response['features']
#     if features:
#         coordinates = features[0]['geometry']['coordinates']
#         return coordinates
#     else:
#         return [0.0, 0.0]

# def save_event_to_mongo(event_details):
#     try:
#         result = events_collection.update_one(
#             {
#                 "title": event_details["title"],
#                 "date": event_details["date"],
#                 "location.coordinates": event_details["location"]["coordinates"]
#             },
#             {"$set": event_details},
#             upsert=True
#         )
#         if result.upserted_id:
#             logging.info(f"Event saved to MongoDB with ID: {result.upserted_id}")
#         else:
#             logging.info(f"Event updated in MongoDB")
#     except errors.PyMongoError as e:
#         logging.error(f"Error saving event to MongoDB: {e}")

# def fetch_and_store_events():
#     locations = ["New York"]  # Limiting to New York for simplicity
#     keywords = ["concert"]  # Limiting to concerts for simplicity

#     event_count = 0

#     for location in locations:
#         eventbrite_events, _ = fetch_events_from_eventbrite(location=location)
#         for event_data in eventbrite_events:
#             event_details = extract_eventbrite_details(event_data)
#             if event_details and event_details['location']['coordinates'] == [0.0, 0.0]:
#                 event_details['location']['coordinates'] = geocode_location(location)
#             if event_details:
#                 save_event_to_mongo(event_details)
#                 event_count += 1
#                 if event_count >= 5:
#                     return

#         ticketmaster_events, _ = fetch_events_from_ticketmaster()
#         for event_data in ticketmaster_events:
#             event_details = extract_ticketmaster_details(event_data)
#             if event_details and event_details['location']['coordinates'] == [0.0, 0.0]:
#                 event_details['location']['coordinates'] = geocode_location(location)
#             if event_details:
#                 save_event_to_mongo(event_details)
#                 event_count += 1
#                 if event_count >= 5:
#                     return

# # Main execution
# if __name__ == "__main__":
#     user_info = authenticate_eventbrite_api()
#     if user_info:
#         logging.info(f"Authenticated successfully: {user_info}")
#         fetch_and_store_events()
#         logging.info("Event generation and storage complete.")
#     else:
#         logging.error("Failed to authenticate with Eventbrite API.")










# import logging
# import requests
# from ratelimit import limits, sleep_and_retry
# from pymongo import MongoClient, errors
# from dotenv import load_dotenv, find_dotenv
# from mapbox import Geocoder

# # Load environment variables
# load_dotenv(find_dotenv())

# # Configure logging
# logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# # MongoDB Configuration
# MONGO_URI = "mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority"
# client = MongoClient(MONGO_URI)
# db = client["Local_Event_Finder_test"]
# events_collection = db["events"]

# # Ensure the unique index exists
# index_name = "title_1_date_1_location.coordinates_1"
# if index_name not in events_collection.index_information():
#     events_collection.create_index([
#         ("title", 1),
#         ("date", 1),
#         ("location.coordinates", "2dsphere")
#     ], unique=True, name=index_name)
#     logging.info("Unique compound index created successfully.")

# # Eventbrite and Ticketmaster API keys
# EVENTBRITE_API_KEY = "QGGXFUGQNGBOVCFDXNLE"
# TICKETMASTER_API_KEY = "1W3s5cOBvfYIgUWO2rBSK3rp3QBF9IGG"

# # Validate API keys
# if not EVENTBRITE_API_KEY:
#     logging.error("Eventbrite API key is missing. Please set it in the .env file.")
#     exit(1)

# if not TICKETMASTER_API_KEY:
#     logging.error("Ticketmaster API key is missing. Please set it in the .env file.")
#     exit(1)

# def authenticate_eventbrite_api():
#     base_url = "https://www.eventbriteapi.com/v3/users/me/"
#     headers = {"Authorization": f"Bearer {EVENTBRITE_API_KEY}"}
    
#     try:
#         response = requests.get(base_url, headers=headers)
#         response.raise_for_status()
#         logging.debug(f"Eventbrite authentication response: {response.text}")
#         return response.json()
#     except requests.exceptions.RequestException as e:
#         logging.error(f"Error authenticating with Eventbrite API: {e.response.text}")
#         return None

# # Fetch events from Eventbrite
# @sleep_and_retry
# @limits(calls=10, period=60)  # Adjust based on the API limits
# def fetch_events_from_eventbrite(location="New York", within="50km", page=1):
#     base_url = "https://www.eventbriteapi.com/v3/events/search/"
#     headers = {"Authorization": f"Bearer {EVENTBRITE_API_KEY}"}
#     params = {
#         "location.address": location,
#         "location.within": within,
#         "page": page,
#         "expand": "venue"
#     }
    
#     try:
#         logging.debug(f"Eventbrite request headers: {headers}")
#         logging.debug(f"Eventbrite request params: {params}")
#         response = requests.get(base_url, headers=headers, params=params)
#         response.raise_for_status()
#         logging.debug(f"Eventbrite response: {response.text}")
#         events = response.json().get('events', [])
#         pagination = response.json().get('pagination', {})
#         return events, pagination
#     except requests.exceptions.RequestException as e:
#         logging.error(f"Error fetching events from Eventbrite: {e.response.text}")
#         return [], {}

# # Fetch events from Ticketmaster
# @sleep_and_retry
# @limits(calls=10, period=60)  # Adjust based on the API limits
# def fetch_events_from_ticketmaster(keyword="concert", size=5, page=0):
#     base_url = "https://app.ticketmaster.com/discovery/v2/events.json"
#     params = {
#         "apikey": TICKETMASTER_API_KEY,
#         "keyword": keyword,
#         "size": size,
#         "page": page,
#         "locale": '*'  # Fetch events from all locales
#     }

#     try:
#         logging.debug(f"Ticketmaster request params: {params}")
#         response = requests.get(base_url, params=params)
#         response.raise_for_status()
#         logging.debug(f"Ticketmaster response: {response.text}")

#         events = response.json().get("_embedded", {}).get("events", [])
#         pagination = response.json().get("page", {})
#         return events, pagination

#     except requests.exceptions.RequestException as e:
#         logging.error(f"Error fetching events from Ticketmaster: {e.response.text}")
#         return [], {}

# def extract_eventbrite_details(event_data):
#     try:
#         event_details = {
#             "title": event_data["name"]["text"],
#             "description": event_data["description"]["text"],
#             "date": event_data["start"]["utc"],
#             "location": {
#                 "type": "Point",
#                 "coordinates": [float(event_data["venue"]["longitude"]), float(event_data["venue"]["latitude"])]
#             },
#             "address": {
#                 "name": event_data["venue"]["name"],
#                 "street": event_data["venue"]["address"]["localized_address_display"]
#             },
#             "category": event_data.get("category", {}).get("name", "General"),
#             "url": event_data["url"]
#         }
#         return event_details
#     except KeyError as e:
#         logging.error(f"Missing key when extracting Eventbrite details: {e}")
#         return None

# def extract_ticketmaster_details(event_data):
#     try:
#         venue = event_data["_embedded"]["venues"][0]
#         event_details = {
#             "title": event_data["name"],
#             "description": event_data.get("info", ""),
#             "date": event_data["dates"]["start"]["dateTime"],
#             "location": {
#                 "type": "Point",
#                 "coordinates": [float(venue["location"]["longitude"]), float(venue["location"]["latitude"])]
#             },
#             "address": {
#                 "name": venue["name"],
#                 "street": venue["address"]["line1"]
#             },
#             "category": event_data["classifications"][0]["segment"]["name"],
#             "url": event_data["url"]
#         }
#         return event_details
#     except KeyError as e:
#         logging.error(f"Missing key when extracting Ticketmaster details: {e}")
#         return None

# def geocode_location(location_name):
#     geocoder = Geocoder(access_token="YOUR_MAPBOX_ACCESS_TOKEN")
#     response = geocoder.forward(location_name).geojson()
#     features = response['features']
#     if features:
#         coordinates = features[0]['geometry']['coordinates']
#         return coordinates
#     else:
#         return [0.0, 0.0]

# def save_event_to_mongo(event_details):
#     try:
#         result = events_collection.update_one(
#             {
#                 "title": event_details["title"],
#                 "date": event_details["date"],
#                 "location.coordinates": event_details["location"]["coordinates"]
#             },
#             {"$set": event_details},
#             upsert=True
#         )
#         if result.upserted_id:
#             logging.info(f"Event saved to MongoDB with ID: {result.upserted_id}")
#         else:
#             logging.info(f"Event updated in MongoDB")
#     except errors.PyMongoError as e:
#         logging.error(f"Error saving event to MongoDB: {e}")

# def fetch_and_store_events():
#     locations = ["New York"]  # Limiting to New York for simplicity
#     keywords = ["concert"]  # Limiting to concerts for simplicity

#     event_count = 0

#     for location in locations:
#         eventbrite_events, _ = fetch_events_from_eventbrite(location=location)
#         for event_data in eventbrite_events:
#             event_details = extract_eventbrite_details(event_data)
#             if event_details['location']['coordinates'] == [0.0, 0.0]:
#                 event_details['location']['coordinates'] = geocode_location(location)
#             if event_details:
#                 save_event_to_mongo(event_details)
#                 event_count += 1
#                 if event_count >= 5:
#                     return

#         ticketmaster_events, _ = fetch_events_from_ticketmaster()
#         for event_data in ticketmaster_events:
#             event_details = extract_ticketmaster_details(event_data)
#             if event_details:
#                 if event_details['location']['coordinates'] == [0.0, 0.0]:
#                     event_details['location']['coordinates'] = geocode_location(location)
#                 save_event_to_mongo(event_details)
#                 event_count += 1
#                 if event_count >= 5:
#                     return

# # Main execution
# if __name__ == "__main__":
#     user_info = authenticate_eventbrite_api()
#     if user_info:
#         logging.info(f"Authenticated successfully: {user_info}")
#         fetch_and_store_events()
#         logging.info("Event generation and storage complete.")
#     else:
#         logging.error("Failed to authenticate with Eventbrite API.")



















