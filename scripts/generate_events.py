import json
import random
from datetime import datetime, timedelta
from faker import Faker
from mapbox import Geocoder
import csv
import string
from tqdm import tqdm
import time

fake = Faker()
mapbox_access_token = 'pk.eyJ1IjoiZXF1YW5zYTAwIiwiYSI6ImNsd3BvMDZubjJzM24yanBwbDV6cmMzM2cifQ.D4NmR6jJ_G_qbDp22fl4gw'
geocoder = Geocoder(access_token=mapbox_access_token)
faker_us = Faker('en_US')

categories = {
    'Music': ['Concert', 'Festival', 'Open Mic', 'DJ Set', 'Live Music'],
    'Sports': ['Basketball Game', 'Soccer Match', 'Tennis Tournament', 'Yoga Class', 'Running Event'],
    'Art': ['Art Exhibition', 'Gallery Opening', 'Sculpture Display', 'Painting Workshop', 'Photography Exhibit'],
    'Food': ['Food Festival', 'Restaurant Week', 'Cooking Class', 'Farmers Market', 'Food Truck Rally'],
    'Tech': ['Tech Conference', 'Coding Workshop', 'Hackathon', 'AI Seminar', 'Startup Pitch Event'],
    'Recreation': ['Outdoor Movie Night', 'Hiking Trip', 'Comedy Show', 'Board Game Night', 'Karaoke Night'],
    'Other': ['Community Meeting', 'Book Club', 'Volunteering Event', 'Poetry Slam', 'Charity Auction'],
}

DEFAULT_CREATOR = '605c72efee7a0c35a8d5a123'

def decimal_to_float(obj):
    if isinstance(obj, float):
        return obj
    elif isinstance(obj, dict):
        return {k: decimal_to_float(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decimal_to_float(x) for x in obj]
    return obj

def generate_demographics():
    age_groups = ["18-24", "25-34", "35-44", "45-54", "55+"]
    interests = ["Music", "Sports", "Art", "Food", "Tech", "Outdoors", "Other"]
    return {
        "ageGroup": random.choice(age_groups),
        "interests": random.sample(interests, random.randint(1, 3))
    }

def geocode_city(city):
    for _ in range(5):  # Retry up to 5 times
        try:
            response = geocoder.forward(city, limit=1)
            data = response.json()
            if 'features' in data and data['features']:
                feature = data['features'][0]
                if feature['place_type'][0] == 'place':  # Ensure a valid place
                    return feature
        except Exception as e:
            print(f"Geocoding failed for city: {city}, retrying...")
            time.sleep(2)  # Exponential backoff
    return None

def reverse_geocode(coordinates):
    for _ in range(5):  # Retry up to 5 times
        try:
            response = geocoder.reverse(lon=coordinates[0], lat=coordinates[1])
            feature = response.json()['features'][0]
            context = feature.get('context', [])
            context_dict = {item['id'].split('.')[0]: item['text'] for item in context}
            return {
                "address": feature.get('place_name', ''),
                "street": context_dict.get('address', 'Unknown Address'),
                "city": context_dict.get('place', 'Unknown City'),
                "state": context_dict.get('region', 'Unknown State'),
                "country": context_dict.get('country', 'Unknown Country'),
                "zipCode": context_dict.get('postcode', 'Unknown')
            }
        except Exception as e:
            print(f"Reverse geocoding failed for coordinates: {coordinates}, retrying...")
            time.sleep(2)  # Exponential backoff
    return None

def load_us_cities(filepath):
    us_cities = []
    with open(filepath, 'r') as file:
        reader = csv.reader(file)
        next(reader)
        for row in reader:
            us_cities.append(row[1])  # Assuming the city name is in the second column
    return us_cities

us_cities = load_us_cities('/mnt/data/cities.csv')

def generate_event_description(category, event_type):
    if category == 'Music':
        return fake.sentence(nb_words=10, variable_nb_words=True) + " featuring " + fake.name()
    elif category == 'Sports':
        return f"Join us for a {event_type} at {fake.company()} Field!"
    elif category == 'Art':
        return f"Explore the latest {event_type} by local artists."
    elif category == 'Food':
        return f"Indulge in delicious treats at our {event_type}."
    elif category == 'Tech':
        return f"Learn and network at the {event_type} on {fake.bs()}"
    elif category == 'Recreation':
        return f"Unwind and have fun at our {event_type}."
    else:  # 'Other'
        return fake.sentence(nb_words=10, variable_nb_words=True)

def generate_events(num_events):
    events = []
    for _ in tqdm(range(num_events), desc="Generating events"):
        city = random.choice(us_cities)
        location = geocode_city(city)

        if not location:
            print(f"Geocoding failed for city: {city}")
            continue

        longitude, latitude = location['geometry']['coordinates']
        location_details = reverse_geocode([longitude, latitude])

        category = random.choice(list(categories.keys()))
        event_type = random.choice(categories[category])
        description = generate_event_description(category, event_type)
        event_date = fake.date_between(start_date='today', end_date='+1y')

        venue = fake.company() + " " + random.choice(["Hall", "Center", "Stadium", "Arena"])
        title = f"{event_type} at {venue}"
        event_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

        events.append({
            "title": title,
            "description": description,
            "date": event_date.strftime('%Y-%m-%dT%H:%M:%S'),
            "time": f"{random.randint(1, 12)}:{str(random.randint(0, 59)).zfill(2)} {random.choice(['AM', 'PM'])}",
            "location": {
                "type": "Point",
                "coordinates": [longitude, latitude],
                "street": location_details['street'],
                "city": location_details['city'],
                "state": location_details['state'],
                "country": location_details['country'],
                "zipCode": location_details['zipCode']
            },
            "category": category,
            "demographics": generate_demographics(),
            "tags": random.sample(list(categories.keys()), random.randint(1, 3)),
            "creator": DEFAULT_CREATOR,
            "event_code": event_code
        })

    return events

# Generate events
event_data = generate_events(2000)
event_data = decimal_to_float(event_data)

# Save events to updated_events.json
with open('updated_events.json', 'w') as f:
    json.dump(event_data, f, indent=4)

print("Generated 2000 detailed events with locations primarily around US cities and saved to updated_events.json.")
