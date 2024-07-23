import random
import uuid
from datetime import datetime, timedelta
from pymongo import MongoClient, errors
import logging
import requests
from ratelimit import limits, sleep_and_retry
from mapbox import Geocoder
from mimesis import Address, Person

# --- Logging Setup ---
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='event_generation.log',
    filemode='w'
)
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
logger = logging.getLogger(__name__)
logger.addHandler(console_handler)
logger.setLevel(logging.INFO)

# --- Configuration ---
MONGO_URI = 'mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority'
DB_NAME = 'Local_Event_Finder_test'

IMGUR_CLIENT_ID = 'effc523c58562a0'
PEXELS_API_KEY = 'uOndOZqFzuQrFTDL0myqsdYpf03qlMgKi0mnExhhrTQOLIGXjHCq6BtX'
MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZXF1YW5zYTAwIiwiYSI6ImNsd3BvMDZubjJzM24yanBwbDV6cmMzM2cifQ.D4NmR6jJ_G_qbDp22fl4gw'
TICKETMASTER_CONSUMER_KEY = '1W3s5cOBvfYIgUWO2rBSK3rp3QBF9IGG'

# MongoDB Configuration
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
events_collection = db["events"]

# Ensure the unique index exists
index_name = "title_1_startDateTime_1_location.coordinates_1_city_1_category_1"
if index_name not in events_collection.index_information():
    events_collection.create_index([
        ("title", 1),
        ("startDateTime", 1),
        ("location.coordinates", "2dsphere"),
        ("location.city", 1),
        ("category", 1)
    ], unique=True, name=index_name)
    logger.info("Unique compound index created successfully.")

cities_states = {
    "New York": "NY",
    "San Francisco": "CA",
    "Los Angeles": "CA",
    "Chicago": "IL",
    "Houston": "TX",
    "Miami": "FL",
    "Atlanta": "GA",
    "Dallas": "TX",
    "Boston": "MA",
    "Seattle": "WA"
}

address = Address()
person = Person()

def generate_random_coordinates(base_coordinates, max_distance_km):
    max_distance_deg = max_distance_km / 111  # 1 degree latitude ~ 111 km
    random_lat = base_coordinates[1] + random.uniform(-max_distance_deg, max_distance_deg)
    random_lon = base_coordinates[0] + random.uniform(-max_distance_deg, max_distance_deg)
    random_lat = max(min(random_lat, 89.9), -89.9)  # Ensure latitude is within [-89.9, 89.9]
    random_lon = (random_lon + 180) % 360 - 180  # Normalize longitude to be within [-180, 180]
    logger.debug(f"Generated coordinates: {random_lat}, {random_lon}")
    return [random_lon, random_lat]

def generate_dynamic_description(event_name, city):
    descriptions = {
        'Concert': [
            f"Join us for an unforgettable evening of live music in {city}. Enjoy performances from top artists in a vibrant atmosphere.",
            f"Experience an incredible night of music in {city}. Featuring performances by renowned artists.",
            f"Get ready for a spectacular concert in {city}. An evening filled with music, energy, and excitement.",
            f"Don't miss this amazing concert in {city}. A night of unforgettable performances awaits you.",
            f"Enjoy a night of top-notch music at our concert in {city}. An event you won't want to miss."
        ],
        'Tech Meetup': [
            f"Connect with fellow tech enthusiasts at our Tech Meetup in {city}. Share ideas, network, and stay updated with the latest in technology.",
            f"Join us in {city} for a tech meetup that brings together innovators and enthusiasts. Expand your network and knowledge.",
            f"Participate in our tech meetup in {city} and discuss the latest trends in technology. A must-attend event for tech lovers.",
            f"Engage with experts and peers at our tech meetup in {city}. Learn about the newest developments in the tech world.",
            f"Join our tech community in {city} for an evening of insightful talks and networking opportunities."
        ],
        'School Play': [
            f"Experience the magic of theatre at our school play in {city}. Witness the talent and hard work of our students on stage.",
            f"Join us in {city} for a delightful school play. Watch our students bring the story to life with their performances.",
            f"Be captivated by the talent of our students at the school play in {city}. A theatrical experience you won't forget.",
            f"Enjoy a wonderful evening of drama and entertainment at our school play in {city}.",
            f"Watch the creativity and dedication of our students at the school play in {city}. An event for the whole family."
        ],
        'Church Event': [
            f"Be a part of our community at the upcoming church event in {city}. Engage in spiritual activities and fellowship.",
            f"Join us in {city} for a church event filled with worship, fellowship, and inspiration.",
            f"Participate in our church event in {city} and connect with our community. A day of spiritual growth and togetherness.",
            f"Experience the warmth and support of our church community at the event in {city}.",
            f"Join our congregation in {city} for a meaningful church event. Worship, fellowship, and inspiration await you."
        ],
        'Art Exhibition': [
            f"Explore the world of art at our exhibition in {city}. Discover works from local and international artists.",
            f"Join us in {city} for an art exhibition that showcases stunning works from talented artists.",
            f"Experience the beauty and creativity of art at our exhibition in {city}. A feast for the eyes.",
            f"Discover the diverse world of art at our exhibition in {city}. An event for art lovers of all ages.",
            f"Immerse yourself in the art scene at our exhibition in {city}. Featuring works from established and emerging artists."
        ],
        'Food Festival': [
            f"Taste the flavors of the world at our food festival in {city}. Enjoy a variety of cuisines from different cultures.",
            f"Join us in {city} for a food festival that celebrates culinary diversity. Taste dishes from around the globe.",
            f"Indulge in a culinary adventure at our food festival in {city}. From street food to gourmet meals.",
            f"Discover new favorite dishes and enjoy a day of food-filled fun at our festival in {city}.",
            f"Celebrate the art of cooking and eating at our food festival in {city}. A culinary journey not to be missed."
        ],
        'Charity Run': [
            f"Join us for a charity run in {city} to support a good cause. Run, walk, or jog to make a difference.",
            f"Participate in our charity run in {city} and help raise funds for a noble cause. Every step counts.",
            f"Get moving for a cause at our charity run in {city}. A day of fitness, fun, and philanthropy.",
            f"Join the community in {city} for a charity run that supports important causes. Lace up your running shoes and join us.",
            f"Run, walk, or jog at our charity event in {city}. Help make a difference while staying active and healthy."
        ],
        'Business Conference': [
            f"Attend our business conference in {city} to gain insights from industry leaders. Network and learn about the latest trends.",
            f"Join us in {city} for a business conference that brings together experts and innovators. Expand your business knowledge.",
            f"Participate in our business conference in {city} and stay ahead of industry trends. A must-attend event for professionals.",
            f"Engage with industry leaders and professionals at our business conference in {city}. Learn, network, and grow.",
            f"Experience a day of knowledge and networking at our business conference in {city}. Connect with like-minded professionals."
        ]
    }
    
    description = random.choice(descriptions.get(event_name, [f"This is a wonderful {event_name} happening in {city}."]))
    logger.debug(f"Generated description for {event_name} in {city}: {description}")
    return description

def generate_random_event(base_coordinates):
    event_id = str(uuid.uuid4())
    event_name = random.choice([
        'Concert', 'Tech Meetup', 'School Play', 'Church Event', 
        'Art Exhibition', 'Food Festival', 'Charity Run', 'Business Conference'
    ])
    
    city = random.choice(list(cities_states.keys()))
    state = cities_states[city]
    country = 'USA'
    coordinates = generate_random_coordinates(base_coordinates, random.randint(0, 20000))  # Up to 20,000 km for worldwide
    start_time = datetime.now() + timedelta(days=random.randint(1, 30))
    end_time = start_time + timedelta(hours=random.randint(1, 5))
    timezone = 'America/New_York'
    category = event_name
    sub_category = f"{category} Subcategory"
    tags = [event_name, city, category]
    organizer_info = person.full_name()
    capacity = random.randint(50, 500)
    rsvp_count = random.randint(0, capacity)
    ticket_info = random.choice(['Free', 'Paid'])
    images = [fetch_image_from_pexels(event_name)]  # Fetch image from Pexels
    created_by = str(uuid.uuid4())
    created_date = datetime.now()
    updated_by = created_by
    updated_date = created_date

    description = generate_dynamic_description(event_name, city)
    address_line1 = address.address()

    event = {
        'eventId': event_id,
        'title': f"{event_name} - {event_id}",
        'description': description,
        'startDateTime': start_time.isoformat(),
        'endDateTime': end_time.isoformat(),
        'timezone': timezone,
        'location': {
            'type': 'Point',
            'coordinates': coordinates,
            'addressLine1': address_line1,
            'city': city,
            'state': state,
            'country': country,
        },
        'category': category,
        'subCategory': sub_category,
        'tags': tags,
        'organizerInfo': organizer_info,
        'capacity': capacity,
        'rsvpCount': rsvp_count,
        'ticketInfo': ticket_info,
        'images': images,
        'createdBy': created_by,
        'createdDate': created_date.isoformat(),
        'updatedBy': updated_by,
        'updatedDate': updated_date.isoformat(),
        'source': 'Random',  # Indicate the source of the event
        'userFeedback': []  # Add a field to store user feedback
    }

    logger.info(f"Generated random event: {event['title']} in {event['location']['city']}, {event['location']['state']}")
    return event

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
        logger.debug(f"Ticketmaster request params: {params}")
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        logger.debug(f"Ticketmaster response: {response.text}")

        events = response.json().get("_embedded", {}).get("events", [])
        pagination = response.json().get("page", {})
        return events, pagination

    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching events from Ticketmaster: {e.response.text}")
        return [], {}

def extract_ticketmaster_details(event_data):
    try:
        venue = event_data.get("_embedded", {}).get("venues", [{}])[0]
        location_data = venue.get("location", {})
        event_details = {
            "eventId": str(uuid.uuid4()),
            "title": event_data.get("name", "No Title"),
            "description": event_data.get("info", ""),
            "startDateTime": event_data.get("dates", {}).get("start", {}).get("dateTime", ""),
            "endDateTime": (datetime.strptime(event_data.get("dates", {}).get("start", {}).get("dateTime", ""), '%Y-%m-%dT%H:%M:%SZ') + timedelta(hours=2)).isoformat(),  # Assuming events last 2 hours
            "timezone": 'America/New_York',
            "location": {
                "type": "Point",
                "coordinates": [float(location_data.get("longitude", 0)), float(location_data.get("latitude", 0))],
                "addressLine1": venue.get("address", {}).get("line1", "Unknown Address"),
                "city": venue.get("city", {}).get("name", "Unknown City"),
                "state": venue.get("state", {}).get("stateCode", "Unknown State"),
                "country": "USA",
            },
            "category": event_data.get("classifications", [{}])[0].get("segment", {}).get("name", "General"),
            "subCategory": f"{event_data.get('classifications', [{}])[0].get('segment', {}).get('name', 'General')} Subcategory",
            "tags": [event_data.get("classifications", [{}])[0].get("segment", {}).get("name", "General"), venue.get("city", {}).get("name", "Unknown City"), event_data.get("classifications", [{}])[0].get("segment", {}).get("name", "General")],
            "organizerInfo": "Organizer Name",
            "capacity": random.randint(50, 500),
            "rsvpCount": random.randint(0, 500),
            "ticketInfo": "Paid",
            "images": [event_data.get("images", [{}])[0].get("url", "https://example.com/default.jpg")],
            "createdBy": str(uuid.uuid4()),
            "createdDate": datetime.now().isoformat(),
            "updatedBy": str(uuid.uuid4()),
            "updatedDate": datetime.now().isoformat(),
            "source": "Ticketmaster",  # Indicate the source of the event
            "userFeedback": []  # Add a field to store user feedback
        }
        logger.info(f"Extracted event from Ticketmaster: {event_details['title']} in {event_details['location']['city']}, {event_details['location']['state']}")
        return event_details
    except KeyError as e:
        logger.error(f"Missing key when extracting Ticketmaster details: {e}")
        return None

def geocode_location(location_name):
    geocoder = Geocoder(access_token=MAPBOX_ACCESS_TOKEN)
    response = geocoder.forward(location_name).geojson()
    features = response['features']
    if features:
        coordinates = features[0]['geometry']['coordinates']
        logger.debug(f"Geocoded location {location_name}: {coordinates}")
        return coordinates
    else:
        logger.warning(f"Failed to geocode location: {location_name}")
        return None

def fetch_image_from_pexels(query):
    headers = {
        "Authorization": PEXELS_API_KEY
    }
    params = {
        "query": query,
        "per_page": 1
    }
    response = requests.get("https://api.pexels.com/v1/search", headers=headers, params=params)
    data = response.json()
    if data['photos']:
        image_url = data['photos'][0]['src']['original']
        logger.info(f"Fetched image from Pexels: {image_url}")
        return image_url
    else:
        logger.warning(f"No images found for query: {query}")
        return "https://example.com/default.jpg"

def upload_image_to_imgur(image_url):
    headers = {
        "Authorization": f"Client-ID {IMGUR_CLIENT_ID}"
    }
    data = {
        "image": image_url,
        "type": "URL"
    }
    response = requests.post("https://api.imgur.com/3/upload", headers=headers, data=data)
    data = response.json()
    if data['success']:
        imgur_url = data['data']['link']
        logger.info(f"Uploaded image to Imgur: {imgur_url}")
        return imgur_url
    else:
        logger.error(f"Failed to upload image to Imgur: {data}")
        return image_url

def save_event_to_mongodb(event_details):
    try:
        result = events_collection.update_one(
            {
                "title": event_details['title'],
                "startDateTime": event_details['startDateTime'],
                "location.coordinates": event_details['location']['coordinates'],
                "location.city": event_details['location']['city'],
                "category": event_details['category'],
            },
            {"$set": event_details},
            upsert=True
        )
        if result.upserted_id:
            logger.info(f"Event saved to MongoDB with ID: {result.upserted_id} (Source: {event_details['source']})")
        else:
            logger.info(f"Event updated in MongoDB: {event_details['title']} (Source: {event_details['source']})")
    except errors.PyMongoError as e:
        logger.error(f"Error saving event to MongoDB: {e}")

def fetch_and_store_events():
    locations = ["New York", "Los Angeles", "Chicago", "Houston", "Miami", "Atlanta", "Dallas", "Boston", "Seattle"]  # Expanded locations
    keywords = ["concert", "conference", "meetup", "festival", "play"]  # Added more keywords

    event_count = 0

    for location in locations:
        for keyword in keywords:
            ticketmaster_events, _ = fetch_events_from_ticketmaster(keyword=keyword)
            for event_data in ticketmaster_events:
                event_details = extract_ticketmaster_details(event_data)
                if event_details:
                    geocoded_coordinates = geocode_location(f"{event_details['location']['addressLine1']}, {event_details['location']['city']}, {event_details['location']['state']}")
                    if geocoded_coordinates:
                        event_details['location']['coordinates'] = geocoded_coordinates
                        event_details['images'][0] = upload_image_to_imgur(event_details['images'][0])  # Upload image to Imgur
                        save_event_to_mongodb(event_details)
                        event_count += 1
                        if event_count >= 10:
                            logger.info(f"Fetched and stored {event_count} events from Ticketmaster.")
                            return

if __name__ == "__main__":
    logger.info("Starting random event generation process...")
    
    base_coordinates = [-73.935242, 40.730610]  # New York City coordinates
    
    num_events = 10  # Generate 10 random events
    for _ in range(num_events):
        event = generate_random_event(base_coordinates)
        event['images'][0] = upload_image_to_imgur(event['images'][0])  # Upload image to Imgur
        save_event_to_mongodb(event)
    
    logger.info("Random event generation process completed.")

    logger.info("Starting Ticketmaster event fetching process...")
    fetch_and_store_events()
    logger.info("Ticketmaster event fetching and storage complete.")













#BEST ONE SO FAR!!!!!!
# import random
# import uuid
# from datetime import datetime, timedelta
# from pymongo import MongoClient, errors
# import logging
# import requests
# from ratelimit import limits, sleep_and_retry
# from mapbox import Geocoder
# from mimesis import Address, Person

# # --- Logging Setup ---
# logging.basicConfig(
#     level=logging.DEBUG,
#     format='%(asctime)s - %(levelname)s - %(message)s',
#     filename='event_generation.log',
#     filemode='w'
# )
# console_handler = logging.StreamHandler()
# console_handler.setLevel(logging.INFO)
# logger = logging.getLogger(__name__)
# logger.addHandler(console_handler)
# logger.setLevel(logging.INFO)

# # --- Configuration ---
# MONGO_URI = 'mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority'
# DB_NAME = 'Local_Event_Finder_test'

# # MongoDB Configuration
# client = MongoClient(MONGO_URI)
# db = client[DB_NAME]
# events_collection = db["events"]

# # Ensure the unique index exists
# index_name = "title_1_startDateTime_1_location.coordinates_1_city_1_category_1"
# if index_name not in events_collection.index_information():
#     events_collection.create_index([
#         ("title", 1),
#         ("startDateTime", 1),
#         ("location.coordinates", "2dsphere"),
#         ("location.city", 1),
#         ("category", 1)
#     ], unique=True, name=index_name)
#     logger.info("Unique compound index created successfully.")

# cities_states = {
#     "New York": "NY",
#     "San Francisco": "CA",
#     "Los Angeles": "CA",
#     "Chicago": "IL",
#     "Houston": "TX"
# }

# TICKETMASTER_CONSUMER_KEY = "1W3s5cOBvfYIgUWO2rBSK3rp3QBF9IGG"
# MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiZXF1YW5zYTAwIiwiYSI6ImNsd3BvMDZubjJzM24yanBwbDV6cmMzM2cifQ.D4NmR6jJ_G_qbDp22fl4gw"

# address = Address()
# person = Person()

# def generate_random_coordinates(base_coordinates, max_distance_km):
#     max_distance_deg = max_distance_km / 111  # 1 degree latitude ~ 111 km
#     random_lat = base_coordinates[1] + random.uniform(-max_distance_deg, max_distance_deg)
#     random_lon = base_coordinates[0] + random.uniform(-max_distance_deg, max_distance_deg)
#     random_lat = max(min(random_lat, 89.9), -89.9)  # Ensure latitude is within [-89.9, 89.9]
#     random_lon = (random_lon + 180) % 360 - 180  # Normalize longitude to be within [-180, 180]
#     logger.debug(f"Generated coordinates: {random_lat}, {random_lon}")
#     return [random_lon, random_lat]

# def generate_dynamic_description(event_name, city):
#     descriptions = {
#         'Concert': [
#             f"Join us for an unforgettable evening of live music in {city}. Enjoy performances from top artists in a vibrant atmosphere.",
#             f"Experience an incredible night of music in {city}. Featuring performances by renowned artists.",
#             f"Get ready for a spectacular concert in {city}. An evening filled with music, energy, and excitement.",
#             f"Don't miss this amazing concert in {city}. A night of unforgettable performances awaits you.",
#             f"Enjoy a night of top-notch music at our concert in {city}. An event you won't want to miss."
#         ],
#         'Tech Meetup': [
#             f"Connect with fellow tech enthusiasts at our Tech Meetup in {city}. Share ideas, network, and stay updated with the latest in technology.",
#             f"Join us in {city} for a tech meetup that brings together innovators and enthusiasts. Expand your network and knowledge.",
#             f"Participate in our tech meetup in {city} and discuss the latest trends in technology. A must-attend event for tech lovers.",
#             f"Engage with experts and peers at our tech meetup in {city}. Learn about the newest developments in the tech world.",
#             f"Join our tech community in {city} for an evening of insightful talks and networking opportunities."
#         ],
#         'School Play': [
#             f"Experience the magic of theatre at our school play in {city}. Witness the talent and hard work of our students on stage.",
#             f"Join us in {city} for a delightful school play. Watch our students bring the story to life with their performances.",
#             f"Be captivated by the talent of our students at the school play in {city}. A theatrical experience you won't forget.",
#             f"Enjoy a wonderful evening of drama and entertainment at our school play in {city}.",
#             f"Watch the creativity and dedication of our students at the school play in {city}. An event for the whole family."
#         ],
#         'Church Event': [
#             f"Be a part of our community at the upcoming church event in {city}. Engage in spiritual activities and fellowship.",
#             f"Join us in {city} for a church event filled with worship, fellowship, and inspiration.",
#             f"Participate in our church event in {city} and connect with our community. A day of spiritual growth and togetherness.",
#             f"Experience the warmth and support of our church community at the event in {city}.",
#             f"Join our congregation in {city} for a meaningful church event. Worship, fellowship, and inspiration await you."
#         ],
#         'Art Exhibition': [
#             f"Explore the world of art at our exhibition in {city}. Discover works from local and international artists.",
#             f"Join us in {city} for an art exhibition that showcases stunning works from talented artists.",
#             f"Experience the beauty and creativity of art at our exhibition in {city}. A feast for the eyes.",
#             f"Discover the diverse world of art at our exhibition in {city}. An event for art lovers of all ages.",
#             f"Immerse yourself in the art scene at our exhibition in {city}. Featuring works from established and emerging artists."
#         ],
#         'Food Festival': [
#             f"Taste the flavors of the world at our food festival in {city}. Enjoy a variety of cuisines from different cultures.",
#             f"Join us in {city} for a food festival that celebrates culinary diversity. Taste dishes from around the globe.",
#             f"Indulge in a culinary adventure at our food festival in {city}. From street food to gourmet meals.",
#             f"Discover new favorite dishes and enjoy a day of food-filled fun at our festival in {city}.",
#             f"Celebrate the art of cooking and eating at our food festival in {city}. A culinary journey not to be missed."
#         ],
#         'Charity Run': [
#             f"Join us for a charity run in {city} to support a good cause. Run, walk, or jog to make a difference.",
#             f"Participate in our charity run in {city} and help raise funds for a noble cause. Every step counts.",
#             f"Get moving for a cause at our charity run in {city}. A day of fitness, fun, and philanthropy.",
#             f"Join the community in {city} for a charity run that supports important causes. Lace up your running shoes and join us.",
#             f"Run, walk, or jog at our charity event in {city}. Help make a difference while staying active and healthy."
#         ],
#         'Business Conference': [
#             f"Attend our business conference in {city} to gain insights from industry leaders. Network and learn about the latest trends.",
#             f"Join us in {city} for a business conference that brings together experts and innovators. Expand your business knowledge.",
#             f"Participate in our business conference in {city} and stay ahead of industry trends. A must-attend event for professionals.",
#             f"Engage with industry leaders and professionals at our business conference in {city}. Learn, network, and grow.",
#             f"Experience a day of knowledge and networking at our business conference in {city}. Connect with like-minded professionals."
#         ]
#     }
    
#     description = random.choice(descriptions.get(event_name, [f"This is a wonderful {event_name} happening in {city}."]))
#     logger.debug(f"Generated description for {event_name} in {city}: {description}")
#     return description

# def generate_random_event(base_coordinates):
#     event_id = str(uuid.uuid4())
#     event_name = random.choice([
#         'Concert', 'Tech Meetup', 'School Play', 'Church Event', 
#         'Art Exhibition', 'Food Festival', 'Charity Run', 'Business Conference'
#     ])
    
#     city = random.choice(list(cities_states.keys()))
#     state = cities_states[city]
#     country = 'USA'
#     coordinates = generate_random_coordinates(base_coordinates, random.randint(0, 20000))  # Up to 20,000 km for worldwide
#     start_time = datetime.now() + timedelta(days=random.randint(1, 30))
#     end_time = start_time + timedelta(hours=random.randint(1, 5))
#     timezone = 'America/New_York'
#     category = event_name
#     sub_category = f"{category} Subcategory"
#     tags = [event_name, city, category]
#     organizer_info = person.full_name()
#     capacity = random.randint(50, 500)
#     rsvp_count = random.randint(0, capacity)
#     ticket_info = random.choice(['Free', 'Paid'])
#     images = [f'https://example.com/{event_name.lower().replace(" ", "_")}.jpg']
#     created_by = str(uuid.uuid4())
#     created_date = datetime.now()
#     updated_by = created_by
#     updated_date = created_date

#     description = generate_dynamic_description(event_name, city)
#     address_line1 = address.address()

#     event = {
#         'eventId': event_id,
#         'title': event_name,
#         'description': description,
#         'startDateTime': start_time.isoformat(),
#         'endDateTime': end_time.isoformat(),
#         'timezone': timezone,
#         'location': {
#             'type': 'Point',
#             'coordinates': coordinates,
#             'addressLine1': address_line1,
#             'city': city,
#             'state': state,
#             'country': country,
#         },
#         'category': category,
#         'subCategory': sub_category,
#         'tags': tags,
#         'organizerInfo': organizer_info,
#         'capacity': capacity,
#         'rsvpCount': rsvp_count,
#         'ticketInfo': ticket_info,
#         'images': images,
#         'createdBy': created_by,
#         'createdDate': created_date.isoformat(),
#         'updatedBy': updated_by,
#         'updatedDate': updated_date.isoformat(),
#         'source': 'Random'  # Indicate the source of the event
#     }

#     logger.info(f"Generated random event: {event['title']} in {event['location']['city']}, {event['location']['state']}")
#     return event

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
#         logger.debug(f"Ticketmaster request params: {params}")
#         response = requests.get(base_url, params=params)
#         response.raise_for_status()
#         logger.debug(f"Ticketmaster response: {response.text}")

#         events = response.json().get("_embedded", {}).get("events", [])
#         pagination = response.json().get("page", {})
#         return events, pagination

#     except requests.exceptions.RequestException as e:
#         logger.error(f"Error fetching events from Ticketmaster: {e.response.text}")
#         return [], {}

# def extract_ticketmaster_details(event_data):
#     try:
#         venue = event_data.get("_embedded", {}).get("venues", [{}])[0]
#         location_data = venue.get("location", {})
#         event_details = {
#             "eventId": str(uuid.uuid4()),
#             "title": event_data.get("name", "No Title"),
#             "description": event_data.get("info", ""),
#             "startDateTime": event_data.get("dates", {}).get("start", {}).get("dateTime", ""),
#             "endDateTime": (datetime.strptime(event_data.get("dates", {}).get("start", {}).get("dateTime", ""), '%Y-%m-%dT%H:%M:%SZ') + timedelta(hours=2)).isoformat(),  # Assuming events last 2 hours
#             "timezone": 'America/New_York',
#             "location": {
#                 "type": "Point",
#                 "coordinates": [float(location_data.get("longitude", 0)), float(location_data.get("latitude", 0))],
#                 "addressLine1": venue.get("address", {}).get("line1", "Unknown Address"),
#                 "city": venue.get("city", {}).get("name", "Unknown City"),
#                 "state": venue.get("state", {}).get("stateCode", "Unknown State"),
#                 "country": "USA",
#             },
#             "category": event_data.get("classifications", [{}])[0].get("segment", {}).get("name", "General"),
#             "subCategory": f"{event_data.get('classifications', [{}])[0].get('segment', {}).get('name', 'General')} Subcategory",
#             "tags": [event_data.get("classifications", [{}])[0].get("segment", {}).get("name", "General"), venue.get("city", {}).get("name", "Unknown City"), event_data.get("classifications", [{}])[0].get("segment", {}).get("name", "General")],
#             "organizerInfo": "Organizer Name",
#             "capacity": random.randint(50, 500),
#             "rsvpCount": random.randint(0, 500),
#             "ticketInfo": "Paid",
#             "images": [event_data.get("images", [{}])[0].get("url", "https://example.com/default.jpg")],
#             "createdBy": str(uuid.uuid4()),
#             "createdDate": datetime.now().isoformat(),
#             "updatedBy": str(uuid.uuid4()),
#             "updatedDate": datetime.now().isoformat(),
#             "source": "Ticketmaster"  # Indicate the source of the event
#         }
#         logger.info(f"Extracted event from Ticketmaster: {event_details['title']} in {event_details['location']['city']}, {event_details['location']['state']}")
#         return event_details
#     except KeyError as e:
#         logger.error(f"Missing key when extracting Ticketmaster details: {e}")
#         return None

# def geocode_location(location_name):
#     geocoder = Geocoder(access_token=MAPBOX_ACCESS_TOKEN)
#     response = geocoder.forward(location_name).geojson()
#     features = response['features']
#     if features:
#         coordinates = features[0]['geometry']['coordinates']
#         logger.debug(f"Geocoded location {location_name}: {coordinates}")
#         return coordinates
#     else:
#         logger.warning(f"Failed to geocode location: {location_name}")
#         return None

# def save_event_to_mongodb(event_details):
#     try:
#         result = events_collection.update_one(
#             {
#                 "title": event_details['title'],
#                 "startDateTime": event_details['startDateTime'],
#                 "location.coordinates": event_details['location']['coordinates'],
#                 "location.city": event_details['location']['city'],
#                 "category": event_details['category'],
#             },
#             {"$set": event_details},
#             upsert=True
#         )
#         if result.upserted_id:
#             logger.info(f"Event saved to MongoDB with ID: {result.upserted_id} (Source: {event_details['source']})")
#         else:
#             logger.info(f"Event updated in MongoDB: {event_details['title']} (Source: {event_details['source']})")
#     except errors.PyMongoError as e:
#         logger.error(f"Error saving event to MongoDB: {e}")

# def fetch_and_store_events():
#     locations = ["New York"]  # Limiting to New York for simplicity
#     keywords = ["concert"]  # Limiting to concerts for simplicity

#     event_count = 0

#     for location in locations:
#         for keyword in keywords:
#             ticketmaster_events, _ = fetch_events_from_ticketmaster(keyword=keyword)
#             for event_data in ticketmaster_events:
#                 event_details = extract_ticketmaster_details(event_data)
#                 if event_details:
#                     geocoded_coordinates = geocode_location(f"{event_details['location']['addressLine1']}, {event_details['location']['city']}, {event_details['location']['state']}")
#                     if geocoded_coordinates:
#                         event_details['location']['coordinates'] = geocoded_coordinates
#                         save_event_to_mongodb(event_details)
#                         event_count += 1
#                         if event_count >= 5:
#                             logger.info(f"Fetched and stored {event_count} events from Ticketmaster.")
#                             return

# if __name__ == "__main__":
#     logger.info("Starting random event generation process...")
    
#     base_coordinates = [-73.935242, 40.730610]  # New York City coordinates
    
#     num_events = 5  # Generate 500 random events
#     for _ in range(num_events):
#         event = generate_random_event(base_coordinates)
#         save_event_to_mongodb(event)
    
#     logger.info("Random event generation process completed.")

#     logger.info("Starting Ticketmaster event fetching process...")
#     fetch_and_store_events()
#     logger.info("Ticketmaster event fetching and storage complete.")





























# import random
# import uuid
# from datetime import datetime, timedelta
# from pymongo import MongoClient, errors
# import logging
# import requests
# from ratelimit import limits, sleep_and_retry
# from mapbox import Geocoder

# # --- Logging Setup ---
# logging.basicConfig(
#     level=logging.DEBUG,
#     format='%(asctime)s - %(levelname)s - %(message)s',
#     filename='event_generation.log',
#     filemode='w'
# )
# console_handler = logging.StreamHandler()
# console_handler.setLevel(logging.INFO)
# logger = logging.getLogger(__name__)
# logger.addHandler(console_handler)
# logger.setLevel(logging.INFO)

# # --- Configuration ---
# MONGO_URI = 'mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority'
# DB_NAME = 'Local_Event_Finder_test'

# # MongoDB Configuration
# client = MongoClient(MONGO_URI)
# db = client[DB_NAME]
# events_collection = db["events"]

# # Ensure the unique index exists
# index_name = "title_1_startDateTime_1_location.coordinates_1_city_1_category_1"
# if index_name not in events_collection.index_information():
#     events_collection.create_index([
#         ("title", 1),
#         ("startDateTime", 1),
#         ("location.coordinates", "2dsphere"),
#         ("location.city", 1),
#         ("category", 1)
#     ], unique=True, name=index_name)
#     logger.info("Unique compound index created successfully.")

# cities_states = {
#     "New York": "NY",
#     "San Francisco": "CA",
#     "Los Angeles": "CA",
#     "Chicago": "IL",
#     "Houston": "TX"
# }

# TICKETMASTER_CONSUMER_KEY = "1W3s5cOBvfYIgUWO2rBSK3rp3QBF9IGG"
# MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiZXF1YW5zYTAwIiwiYSI6ImNsd3BvMDZubjJzM24yanBwbDV6cmMzM2cifQ.D4NmR6jJ_G_qbDp22fl4gw"

# def generate_random_coordinates(base_coordinates, max_distance_km):
#     max_distance_deg = max_distance_km / 111  # 1 degree latitude ~ 111 km
#     random_lat = base_coordinates[1] + random.uniform(-max_distance_deg, max_distance_deg)
#     random_lon = base_coordinates[0] + random.uniform(-max_distance_deg, max_distance_deg)
#     random_lat = max(min(random_lat, 90), -90)  # Ensure latitude is within [-90, 90]
#     random_lon = (random_lon + 180) % 360 - 180  # Normalize longitude to be within [-180, 180]
#     logger.debug(f"Generated coordinates: {random_lat}, {random_lon}")
#     return [random_lon, random_lat]

# def generate_dynamic_description(event_name, city):
#     descriptions = {
#         'Concert': [
#             f"Join us for an unforgettable evening of live music in {city}. Enjoy performances from top artists in a vibrant atmosphere.",
#             f"Experience an incredible night of music in {city}. Featuring performances by renowned artists.",
#             f"Get ready for a spectacular concert in {city}. An evening filled with music, energy, and excitement.",
#             f"Don't miss this amazing concert in {city}. A night of unforgettable performances awaits you.",
#             f"Enjoy a night of top-notch music at our concert in {city}. An event you won't want to miss."
#         ],
#         'Tech Meetup': [
#             f"Connect with fellow tech enthusiasts at our Tech Meetup in {city}. Share ideas, network, and stay updated with the latest in technology.",
#             f"Join us in {city} for a tech meetup that brings together innovators and enthusiasts. Expand your network and knowledge.",
#             f"Participate in our tech meetup in {city} and discuss the latest trends in technology. A must-attend event for tech lovers.",
#             f"Engage with experts and peers at our tech meetup in {city}. Learn about the newest developments in the tech world.",
#             f"Join our tech community in {city} for an evening of insightful talks and networking opportunities."
#         ],
#         'School Play': [
#             f"Experience the magic of theatre at our school play in {city}. Witness the talent and hard work of our students on stage.",
#             f"Join us in {city} for a delightful school play. Watch our students bring the story to life with their performances.",
#             f"Be captivated by the talent of our students at the school play in {city}. A theatrical experience you won't forget.",
#             f"Enjoy a wonderful evening of drama and entertainment at our school play in {city}.",
#             f"Watch the creativity and dedication of our students at the school play in {city}. An event for the whole family."
#         ],
#         'Church Event': [
#             f"Be a part of our community at the upcoming church event in {city}. Engage in spiritual activities and fellowship.",
#             f"Join us in {city} for a church event filled with worship, fellowship, and inspiration.",
#             f"Participate in our church event in {city} and connect with our community. A day of spiritual growth and togetherness.",
#             f"Experience the warmth and support of our church community at the event in {city}.",
#             f"Join our congregation in {city} for a meaningful church event. Worship, fellowship, and inspiration await you."
#         ],
#         'Art Exhibition': [
#             f"Explore the world of art at our exhibition in {city}. Discover works from local and international artists.",
#             f"Join us in {city} for an art exhibition that showcases stunning works from talented artists.",
#             f"Experience the beauty and creativity of art at our exhibition in {city}. A feast for the eyes.",
#             f"Discover the diverse world of art at our exhibition in {city}. An event for art lovers of all ages.",
#             f"Immerse yourself in the art scene at our exhibition in {city}. Featuring works from established and emerging artists."
#         ],
#         'Food Festival': [
#             f"Taste the flavors of the world at our food festival in {city}. Enjoy a variety of cuisines from different cultures.",
#             f"Join us in {city} for a food festival that celebrates culinary diversity. Taste dishes from around the globe.",
#             f"Indulge in a culinary adventure at our food festival in {city}. From street food to gourmet meals.",
#             f"Discover new favorite dishes and enjoy a day of food-filled fun at our festival in {city}.",
#             f"Celebrate the art of cooking and eating at our food festival in {city}. A culinary journey not to be missed."
#         ],
#         'Charity Run': [
#             f"Join us for a charity run in {city} to support a good cause. Run, walk, or jog to make a difference.",
#             f"Participate in our charity run in {city} and help raise funds for a noble cause. Every step counts.",
#             f"Get moving for a cause at our charity run in {city}. A day of fitness, fun, and philanthropy.",
#             f"Join the community in {city} for a charity run that supports important causes. Lace up your running shoes and join us.",
#             f"Run, walk, or jog at our charity event in {city}. Help make a difference while staying active and healthy."
#         ],
#         'Business Conference': [
#             f"Attend our business conference in {city} to gain insights from industry leaders. Network and learn about the latest trends.",
#             f"Join us in {city} for a business conference that brings together experts and innovators. Expand your business knowledge.",
#             f"Participate in our business conference in {city} and stay ahead of industry trends. A must-attend event for professionals.",
#             f"Engage with industry leaders and professionals at our business conference in {city}. Learn, network, and grow.",
#             f"Experience a day of knowledge and networking at our business conference in {city}. Connect with like-minded professionals."
#         ]
#     }
    
#     description = random.choice(descriptions.get(event_name, [f"This is a wonderful {event_name} happening in {city}."]))
#     logger.debug(f"Generated description for {event_name} in {city}: {description}")
#     return description

# def generate_random_event(base_coordinates):
#     event_id = str(uuid.uuid4())
#     event_name = random.choice([
#         'Concert', 'Tech Meetup', 'School Play', 'Church Event', 
#         'Art Exhibition', 'Food Festival', 'Charity Run', 'Business Conference'
#     ])
    
#     city = random.choice(list(cities_states.keys()))
#     state = cities_states[city]
#     country = 'USA'
#     coordinates = generate_random_coordinates(base_coordinates, random.randint(0, 20000))  # Up to 20,000 km for worldwide
#     start_time = datetime.now() + timedelta(days=random.randint(1, 30))
#     end_time = start_time + timedelta(hours=random.randint(1, 5))
#     timezone = 'America/New_York'
#     category = event_name
#     sub_category = f"{category} Subcategory"
#     tags = [event_name, city, category]
#     organizer_info = 'Organizer Name'
#     capacity = random.randint(50, 500)
#     rsvp_count = random.randint(0, capacity)
#     ticket_info = random.choice(['Free', 'Paid'])
#     images = [f'https://example.com/{event_name.lower().replace(" ", "_")}.jpg']
#     created_by = str(uuid.uuid4())
#     created_date = datetime.now()
#     updated_by = created_by
#     updated_date = created_date

#     description = generate_dynamic_description(event_name, city)

#     event = {
#         'eventId': event_id,
#         'title': event_name,
#         'description': description,
#         'startDateTime': start_time.isoformat(),
#         'endDateTime': end_time.isoformat(),
#         'timezone': timezone,
#         'location': {
#             'type': 'Point',
#             'coordinates': coordinates,
#             'addressLine1': '123 Main St',
#             'city': city,
#             'state': state,
#             'country': country,
#         },
#         'category': category,
#         'subCategory': sub_category,
#         'tags': tags,
#         'organizerInfo': organizer_info,
#         'capacity': capacity,
#         'rsvpCount': rsvp_count,
#         'ticketInfo': ticket_info,
#         'images': images,
#         'createdBy': created_by,
#         'createdDate': created_date.isoformat(),
#         'updatedBy': updated_by,
#         'updatedDate': updated_date.isoformat(),
#         'source': 'Random'  # Indicate the source of the event
#     }

#     logger.info(f"Generated random event: {event['title']} in {event['location']['city']}, {event['location']['state']}")
#     return event

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

# def extract_ticketmaster_details(event_data):
#     try:
#         venue = event_data.get("_embedded", {}).get("venues", [{}])[0]
#         location_data = venue.get("location", {})
#         event_details = {
#             "eventId": str(uuid.uuid4()),
#             "title": event_data.get("name", "No Title"),
#             "description": event_data.get("info", ""),
#             "startDateTime": event_data.get("dates", {}).get("start", {}).get("dateTime", ""),
#             "endDateTime": (datetime.strptime(event_data.get("dates", {}).get("start", {}).get("dateTime", ""), '%Y-%m-%dT%H:%M:%SZ') + timedelta(hours=2)).isoformat(),  # Assuming events last 2 hours
#             "timezone": 'America/New_York',
#             "location": {
#                 "type": "Point",
#                 "coordinates": [float(location_data.get("longitude", 0)), float(location_data.get("latitude", 0))],
#                 "addressLine1": venue.get("address", {}).get("line1", "Unknown Address"),
#                 "city": venue.get("city", {}).get("name", "Unknown City"),
#                 "state": venue.get("state", {}).get("stateCode", "Unknown State"),
#                 "country": "USA",
#             },
#             "category": event_data.get("classifications", [{}])[0].get("segment", {}).get("name", "General"),
#             "subCategory": f"{event_data.get('classifications', [{}])[0].get('segment', {}).get('name', 'General')} Subcategory",
#             "tags": [event_data.get("classifications", [{}])[0].get("segment", {}).get("name", "General"), venue.get("city", {}).get("name", "Unknown City"), event_data.get("classifications", [{}])[0].get("segment", {}).get("name", "General")],
#             "organizerInfo": "Organizer Name",
#             "capacity": random.randint(50, 500),
#             "rsvpCount": random.randint(0, 500),
#             "ticketInfo": "Paid",
#             "images": [event_data.get("images", [{}])[0].get("url", "https://example.com/default.jpg")],
#             "createdBy": str(uuid.uuid4()),
#             "createdDate": datetime.now().isoformat(),
#             "updatedBy": str(uuid.uuid4()),
#             "updatedDate": datetime.now().isoformat(),
#             "source": "Ticketmaster"  # Indicate the source of the event
#         }
#         logger.info(f"Extracted event from Ticketmaster: {event_details['title']} in {event_details['location']['city']}, {event_details['location']['state']}")
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
#         logger.debug(f"Geocoded location {location_name}: {coordinates}")
#         return coordinates
#     else:
#         logger.warning(f"Failed to geocode location: {location_name}")
#         return [0.0, 0.0]

# def save_event_to_mongodb(event_details):
#     try:
#         events_collection.update_one(
#             {
#                 "title": event_details['title'],
#                 "startDateTime": event_details['startDateTime'],
#                 "location.coordinates": event_details['location']['coordinates'],
#                 "location.city": event_details['location']['city'],
#                 "category": event_details['category'],
#             },
#             {"$set": event_details},
#             upsert=True
#         )
#         logger.info(f"Event saved to MongoDB: {event_details['title']} (Source: {event_details['source']})")
#     except errors.DuplicateKeyError:
#         logger.warning(f"Duplicate event found: {event_details['title']} (Source: {event_details['source']})")

# def fetch_and_store_events():
#     locations = ["New York"]  # Limiting to New York for simplicity
#     keywords = ["concert"]  # Limiting to concerts for simplicity

#     event_count = 0

#     for location in locations:
#         for keyword in keywords:
#             ticketmaster_events, _ = fetch_events_from_ticketmaster(keyword=keyword)
#             for event_data in ticketmaster_events:
#                 event_details = extract_ticketmaster_details(event_data)
#                 if event_details and event_details['location']['coordinates'] == [0.0, 0.0]:
#                     event_details['location']['coordinates'] = geocode_location(location)
#                 if event_details:
#                     save_event_to_mongodb(event_details)
#                     event_count += 1
#                     if event_count >= 5:
#                         logger.info(f"Fetched and stored {event_count} events from Ticketmaster.")
#                         return

# if __name__ == "__main__":
#     logger.info("Starting random event generation process...")
    
#     base_coordinates = [-73.935242, 40.730610]  # New York City coordinates
    
#     num_events = 5  # Generate 500 random events
#     for _ in range(num_events):
#         event = generate_random_event(base_coordinates)
#         save_event_to_mongodb(event)
    
#     logger.info("Random event generation process completed.")

#     logger.info("Starting Ticketmaster event fetching process...")
#     fetch_and_store_events()
#     logger.info("Ticketmaster event fetching and storage complete.")





















# import random
# import uuid
# from datetime import datetime, timedelta
# from pymongo import MongoClient, errors
# import logging
# import random

# # --- Logging Setup ---
# logging.basicConfig(
#     level=logging.DEBUG,
#     format='%(asctime)s - %(levelname)s - %(message)s',
#     filename='event_generation.log',
#     filemode='w'
# )
# console_handler = logging.StreamHandler()
# console_handler.setLevel(logging.INFO)
# logger = logging.getLogger(__name__)
# logger.addHandler(console_handler)
# logger.setLevel(logging.INFO)

# # --- Configuration ---
# MONGO_URI = 'mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority'
# DB_NAME = 'Local_Event_Finder_test'

# # MongoDB Configuration
# client = MongoClient(MONGO_URI)
# db = client[DB_NAME]
# events_collection = db["events"]

# # Ensure the unique index exists
# index_name = "title_1_startDateTime_1_location.coordinates_1_city_1_category_1"
# if index_name not in events_collection.index_information():
#     events_collection.create_index([
#         ("title", 1),
#         ("startDateTime", 1),
#         ("location.coordinates", "2dsphere"),
#         ("location.city", 1),
#         ("category", 1)
#     ], unique=True, name=index_name)
#     logger.info("Unique compound index created successfully.")

# cities_states = {
#     "New York": "NY",
#     "San Francisco": "CA",
#     "Los Angeles": "CA",
#     "Chicago": "IL",
#     "Houston": "TX"
# }

# def generate_random_coordinates(base_coordinates, max_distance_km):
#     max_distance_deg = max_distance_km / 111  # 1 degree latitude ~ 111 km
#     random_lat = base_coordinates[1] + random.uniform(-max_distance_deg, max_distance_deg)
#     random_lon = base_coordinates[0] + random.uniform(-max_distance_deg, max_distance_deg)
#     random_lat = max(min(random_lat, 90), -90)  # Ensure latitude is within [-90, 90]
#     random_lon = (random_lon + 180) % 360 - 180  # Normalize longitude to be within [-180, 180]
#     return [random_lon, random_lat]

# def generate_dynamic_description(event_name, city):
#     descriptions = {
#         'Concert': f"Join us for an unforgettable evening of live music in {city}. Enjoy performances from top artists in a vibrant atmosphere.",
#         'Tech Meetup': f"Connect with fellow tech enthusiasts at our Tech Meetup in {city}. Share ideas, network, and stay updated with the latest in technology.",
#         'School Play': f"Experience the magic of theatre at our school play in {city}. Witness the talent and hard work of our students on stage.",
#         'Church Event': f"Be a part of our community at the upcoming church event in {city}. Engage in spiritual activities and fellowship.",
#         'Art Exhibition': f"Explore the world of art at our exhibition in {city}. Discover works from local and international artists.",
#         'Food Festival': f"Taste the flavors of the world at our food festival in {city}. Enjoy a variety of cuisines from different cultures.",
#         'Charity Run': f"Join us for a charity run in {city} to support a good cause. Run, walk, or jog to make a difference.",
#         'Business Conference': f"Attend our business conference in {city} to gain insights from industry leaders. Network and learn about the latest trends."
#     }
#     return descriptions.get(event_name, f"This is a wonderful {event_name} happening in {city}.")

# def generate_random_event(base_coordinates):
#     event_id = str(uuid.uuid4())
#     event_name = random.choice([
#         'Concert', 'Tech Meetup', 'School Play', 'Church Event', 
#         'Art Exhibition', 'Food Festival', 'Charity Run', 'Business Conference'
#     ])
    
#     city = random.choice(list(cities_states.keys()))
#     state = cities_states[city]
#     country = 'USA'
#     coordinates = generate_random_coordinates(base_coordinates, random.randint(0, 20000))  # Up to 20,000 km for worldwide
#     start_time = datetime.now() + timedelta(days=random.randint(1, 30))
#     end_time = start_time + timedelta(hours=random.randint(1, 5))
#     timezone = 'America/New_York'
#     category = event_name
#     sub_category = f"{category} Subcategory"
#     tags = [event_name, city, category]
#     organizer_info = 'Organizer Name'
#     capacity = random.randint(50, 500)
#     rsvp_count = random.randint(0, capacity)
#     ticket_info = random.choice(['Free', 'Paid'])
#     images = [f'https://example.com/{event_name.lower().replace(" ", "_")}.jpg']
#     created_by = str(uuid.uuid4())
#     created_date = datetime.now()
#     updated_by = created_by
#     updated_date = created_date

#     description = generate_dynamic_description(event_name, city)

#     event = {
#         'eventId': event_id,
#         'title': event_name,
#         'description': description,
#         'startDateTime': start_time.isoformat(),
#         'endDateTime': end_time.isoformat(),
#         'timezone': timezone,
#         'location': {
#             'type': 'Point',
#             'coordinates': coordinates,
#             'addressLine1': '123 Main St',
#             'city': city,
#             'state': state,
#             'country': country,
#         },
#         'category': category,
#         'subCategory': sub_category,
#         'tags': tags,
#         'organizerInfo': organizer_info,
#         'capacity': capacity,
#         'rsvpCount': rsvp_count,
#         'ticketInfo': ticket_info,
#         'images': images,
#         'createdBy': created_by,
#         'createdDate': created_date.isoformat(),
#         'updatedBy': updated_by,
#         'updatedDate': updated_date.isoformat(),
#     }

#     return event

# def save_event_to_mongodb(event_details):
#     try:
#         events_collection.update_one(
#             {
#                 "title": event_details['title'],
#                 "startDateTime": event_details['startDateTime'],
#                 "location.coordinates": event_details['location']['coordinates'],
#                 "location.city": event_details['location']['city'],
#                 "category": event_details['category'],
#             },
#             {"$set": event_details},
#             upsert=True
#         )
#         logger.info(f"Event saved to MongoDB: {event_details['title']}")
#     except errors.DuplicateKeyError:
#         logger.warning(f"Duplicate event found: {event_details['title']}")

# if __name__ == "__main__":
#     logger.info("Starting event generation process...")
    
#     base_coordinates = [-73.935242, 40.730610]  # New York City coordinates
    
#     num_events = 500  # Generate 500 random events
#     for _ in range(num_events):
#         event = generate_random_event(base_coordinates)
#         save_event_to_mongodb(event)
    
#     logger.info("Event generation process completed.")






      











# #gathertown-frontend/scripts/generate_events.py
# import json
# import logging
# import os
# import random
# import time
# from datetime import datetime, timedelta
# from pymongo import MongoClient, errors
# from tqdm import tqdm
# from mimesis import Address, Datetime, Generic, Person
# from mimesis.enums import Gender
# from mimesis.locales import Locale
# from country_list import countries_for_language
# import cloudinary
# import cloudinary.uploader
# import requests
# from urllib3.util.retry import Retry
# from requests.adapters import HTTPAdapter
# from ratelimit import limits, sleep_and_retry
# from mapbox import Geocoder, errors as mapbox_errors

# # --- Logging Setup ---
# logging.basicConfig(
#     level=logging.DEBUG,
#     format='%(asctime)s - %(levelname)s - %(message)s',
#     filename='event_generation.log',
#     filemode='w'
# )
# console_handler = logging.StreamHandler()
# console_handler.setLevel(logging.INFO)
# logger = logging.getLogger(__name__)
# logger.addHandler(console_handler)
# logger.setLevel(logging.INFO)  # Allow configuration of log level via environment variable

# # --- Configuration ---
# EVENTBRITE_API_KEY = 'AL7OKVBPHS6GMLQRKWEE'  # Updated with the captured OAuth token
# TICKETMASTER_API_KEY = '1W3s5cOb6rYlgJWO2rBSK3rp3QBF9jGG'
# MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZXF1YW5zYTAwIiwiYSI6ImNsd3BvMDZubjJzM24yanBwbDV6cmMzM2cifQ.D4NmR6jJ_G_qbDp22fl4gw'
# MONGO_URI = 'mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority'
# DB_NAME = 'Local_Event_Finder_test'
# EVENT_LIMIT = 2  # Set to 2 for testing purposes
# BATCH_SIZE = 2

# DEFAULT_CREATOR = '605c72efee7a0c35a8d5a123'
# DEFAULT_DESCRIPTION = "This is a great event you don't want to miss!"

# # Check if required environment variables are set
# if not all([EVENTBRITE_API_KEY, TICKETMASTER_API_KEY, MAPBOX_ACCESS_TOKEN, MONGO_URI, DB_NAME]):
#     raise EnvironmentError("One or more required environment variables are missing")

# # MongoDB Configuration
# client = MongoClient(MONGO_URI)
# db = client[DB_NAME]
# events_collection = db["events"]

# # Ensure the unique index exists
# index_name = "title_1_date_1_location.coordinates_1"
# if index_name not in events_collection.index_information():
#     events_collection.create_index([
#         ("title", 1),
#         ("date", 1),
#         ("location.coordinates", "2dsphere")
#     ], unique=True, name=index_name)
#     logger.info("Unique compound index created successfully.")

# cloudinary.config(
#     cloud_name='dwpamedkm',
#     api_key='467823737854287',
#     api_secret='p8lcsI125dMVNFoly6GtUI0ejz8'
# )

# geocoder = Geocoder(access_token=MAPBOX_ACCESS_TOKEN)

# # Event Categories and Tags
# categories = {
#     "Business & Professional": {
#         "types": ["Conference", "Seminar", "Workshop", "Networking Event", "Job Fair"],
#         "tags": ["business", "networking", "career", "professional development", "industry"]
#     },
#     # Add other categories here
# }

# def decimal_to_float(d):
#     return float(d)

# def generate_demographics(category):
#     generic = Generic(Locale.EN)
#     age = random.randint(18, 70)
#     gender = random.choice([Gender.MALE, Gender.FEMALE])
#     income = random.randint(30000, 120000)
#     return {
#         'age': age,
#         'gender': gender.name,
#         'income': income,
#         'category_interest': category
#     }

# def geocode_location(location_name):
#     try:
#         response = geocoder.forward(location_name)
#         if response.status_code == 200:
#             data = response.json()
#             if data['features']:
#                 return data['features'][0]['center']
#     except mapbox_errors.MapboxError as e:
#         logger.error(f"Geocoding error: {e}")
#     return [0.0, 0.0]

# def normalize_address(address_data):
#     components = []
#     if address_data.get("address_1"):
#         components.append(address_data["address_1"])
#     if address_data.get("address_2"):
#         components.append(address_data["address_2"])
#     return ", ".join(components)

# @sleep_and_retry
# @limits(calls=10, period=60)  # Adjust based on the API limits
# def fetch_events_from_eventbrite(location="New York", within="50km", page=1):
#     # Updated Eventbrite API endpoint (v3 to v5)
#     base_url = "https://www.eventbriteapi.com/v3/events/search/"

#     headers = {"Authorization": f"Bearer {EVENTBRITE_API_KEY}"}
#     params = {
#         "location.address": location,
#         "location.within": within,
#         "page": page,
#         "expand": "venue"
#     }

#     try:
#         logger.debug(f"Eventbrite request headers: {headers}")
#         logger.debug(f"Eventbrite request params: {params}")
#         response = requests.get(base_url, headers=headers, params=params)
#         response.raise_for_status()  # Raise an error for bad responses
#         logger.debug(f"Eventbrite response: {response.text}")
#         events = response.json().get('events', [])
#         pagination = response.json().get('pagination', {})
#         return events, pagination
#     except requests.exceptions.RequestException as e:
#         logger.error(f"Error fetching events from Eventbrite: {e.response.text}")
#         return [], {}  # Return empty lists in case of error

# @sleep_and_retry
# @limits(calls=10, period=60)  # Adjust based on the API limits
# def fetch_events_from_ticketmaster(keyword="concert", size=100, page=0):
#     base_url = "https://app.ticketmaster.com/discovery/v2/events.json"
#     params = {
#         "apikey": TICKETMASTER_API_KEY,  # Fixed the missing closing quotation mark
#         "keyword": keyword,
#         "size": size,
#         "page": page,
#         "locale": '*'
#     }

#     try:
#         logger.debug(f"Ticketmaster request params: {params}")
#         response = requests.get(base_url, params=params)
#         response.raise_for_status()
#         logger.debug(f"Ticketmaster response: {response.text}")

#         data = response.json()  # Get the JSON data directly

#         if "_embedded" in data and "events" in data["_embedded"]:  # Check for events
#             events = data["_embedded"]["events"]
#         else:
#             events = []  # Handle case where no events are found
#             logger.warning("No events found in Ticketmaster response.")

#         pagination = data.get("page", {})
#         return events, pagination

#     except requests.exceptions.RequestException as e:
#         logger.error(f"Error fetching events from Ticketmaster: {e}")
#         return [], {}

# def extract_eventbrite_details(event_data):
#     venue = event_data.get('venue', {})
#     address = venue.get('address', {})

#     city = address.get('city', 'Unknown City')
#     state = address.get('region', 'Unknown State')
#     country = address.get('country', 'US')

#     event_details = {
#         "title": event_data.get('name', {}).get('text', ''),
#         "description": event_data.get('description', {}).get('text', '') or DEFAULT_DESCRIPTION,
#         "date": event_data.get('start', {}).get('local', '').split('T')[0],
#         "time": event_data.get('start', {}).get('local', '').split('T')[1].split('-')[0],
#         "location": {
#             "type": "Point",
#             "coordinates": geocode_location(city + ", " + state + ", " + country),
#             "city": city,
#             "state": state,
#             "country": country,
#             "normalized_address": normalize_address(address),
#         },
#         "creator": DEFAULT_CREATOR,
#         "demographics": generate_demographics(event_data.get('category', {}).get('name', 'General')),
#         "tags": [tag.strip() for tag in event_data.get('category', {}).get('name', 'General').split(',')],
#         "price": event_data.get('is_free', False) and 'Free' or 'Paid',
#     }
#     return event_details

# def extract_ticketmaster_details(event_data):
#     venue = event_data.get('_embedded', {}).get('venues', [{}])[0]

#     city = venue.get('city', {}).get('name', 'Unknown City')  # Use .get() with default value
#     state = venue.get('state', {}).get('stateCode', 'Unknown State')  # Extract stateCode if available
#     country = venue.get('country', {}).get('name', 'Unknown Country')  # Extract country name if available

#     event_details = {
#         "title": event_data.get('name', ''),
#         "description": event_data.get('info', '') or DEFAULT_DESCRIPTION,
#         "date": event_data.get('dates', {}).get('start', {}).get('localDate', ''),
#         "time": event_data.get('dates', {}).get('start', {}).get('localTime', ''),
#         "location": {
#             "type": "Point",
#             "coordinates": geocode_location(f"{city}, {state}, {country}"),
#             "city": city,
#             "state": state,
#             "country": country,
#             "normalized_address": venue.get('address', {}).get('line1', '')
#         },
#         "creator": DEFAULT_CREATOR,
#         "demographics": generate_demographics('General'),
#         "tags": [tag.strip() for tag in event_data.get('classifications', [{}])[0].get('genre', {}).get('name', 'General').split(',')],
#         "price": 'Paid',  # Assume all Ticketmaster events are paid
#     }
#     return event_details

# def upload_image_to_cloudinary(image_url):
#     try:
#         result = cloudinary.uploader.upload(image_url)
#         return result['secure_url']
#     except Exception as e:
#         logger.error(f"Error uploading image to Cloudinary: {e}")
#         return ""

# def save_event_to_mongodb(event_details):
#     try:
#         events_collection.update_one(
#             {
#                 "title": event_details['title'],
#                 "date": event_details['date'],
#                 "location.coordinates": event_details['location']['coordinates'],
#             },
#             {"$set": event_details},
#             upsert=True
#         )
#     except errors.DuplicateKeyError:
#         logger.warning(f"Duplicate event found: {event_details['title']}")

# def fetch_and_save_events():
#     eventbrite_events, eventbrite_pagination = fetch_events_from_eventbrite()
#     ticketmaster_events, ticketmaster_pagination = fetch_events_from_ticketmaster()

#     events = []

#     for event in eventbrite_events:
#         details = extract_eventbrite_details(event)
#         if details:  # Check if details are not None
#             events.append(details)

#     for event in ticketmaster_events:
#         details = extract_ticketmaster_details(event)
#         if details:  # Check if details are not None
#             events.append(details)

#     for event in tqdm(events, desc="Saving events to MongoDB"):
#         save_event_to_mongodb(event)

# if __name__ == "__main__":
#     logger.info("Starting event generation process...")
#     fetch_and_save_events()
#     logger.info("Event generation process completed.")


