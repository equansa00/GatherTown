import json
from datetime import datetime, timedelta
import random
from faker import Faker
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

fake = Faker()
geolocator = Nominatim(user_agent="event_generator")
geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)  # Rate limit to avoid overusing the API

categories = {
    'Music': ['Concert', 'Festival', 'Opera', 'Musical', 'DJ Set', 'Open Mic Night'],
    'Sports': ['Game', 'Match', 'Tournament', 'Race', 'Meet', 'Championship'],
    'Art': ['Exhibition', 'Gallery Opening', 'Performance Art', 'Installation', 'Workshop'],
    'Food': ['Tasting', 'Festival', 'Market', 'Pop-up', 'Dinner', 'Brunch'],
    'Tech': ['Conference', 'Workshop', 'Hackathon', 'Product Launch', 'Demo Day'],
    'Recreation': ['Outdoor Movie', 'Comedy Show', 'Trivia Night', 'Class', 'Tour', 'Walk'],
    'Other': ['Fundraiser', 'Party', 'Seminar', 'Workshop', 'Meetup', 'Networking Event']
}

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

def generate_global_events(num_events, main_cities):
    events = []

    for city, ratio in main_cities.items():
        num_city_events = int(num_events * ratio)

        for _ in range(num_city_events):
            try:
                location = geocode(city)
                if not location:
                    print(f"Geocoding failed for city: {city}")
                    continue

                # Introduce some randomness to location within the city
                longitude = location.longitude + random.uniform(-0.02, 0.02)
                latitude = location.latitude + random.uniform(-0.02, 0.02)

                category = random.choice(list(categories.keys()))
                event_type = random.choice(categories[category])
                description = fake.paragraph(nb_sentences=3)
                event_date = datetime.now() + timedelta(days=random.randint(1, 365))

                # More descriptive event titles
                venue = fake.company() + " " + random.choice(["Hall", "Center", "Stadium", "Arena"])
                title = f"{event_type} at {venue}"

                events.append({
                    "title": title,
                    "description": description,
                    "date": event_date.strftime('%Y-%m-%dT%H:%M:%S'),
                    "location": {
                        "type": "Point",
                        "coordinates": [float(longitude), float(latitude)],
                        "city": location.raw.get('address', {}).get('city', 'Unknown City'),
                        "state": location.raw.get('address', {}).get('state', 'Unknown State'),
                        "country": location.raw.get('address', {}).get('country', 'Unknown Country'),
                        "zipCode": location.raw.get('address', {}).get('postcode', '00000')
                    },
                    "category": category,
                    "time": f"{random.randint(1, 12)}:{str(random.randint(0, 59)).zfill(2)} {random.choice(['AM', 'PM'])}",
                    "demographics": generate_demographics(),
                    "tags": random.sample(categories.keys(), random.randint(1, 3))
                })
            except Exception as e:
                print(f"Error occurred while geocoding {city}: {e}")

    num_worldwide_events = num_events - sum(int(num_events * ratio) for ratio in main_cities.values())
    for _ in range(num_worldwide_events):
        try:
            latitude = fake.latitude()
            longitude = fake.longitude()

            category = random.choice(list(categories.keys()))
            event_type = random.choice(categories[category])
            description = fake.paragraph(nb_sentences=3)
            event_date = datetime.now() + timedelta(days=random.randint(1, 365))

            # More descriptive event titles
            venue = fake.company() + " " + random.choice(["Hall", "Center", "Stadium", "Arena"])
            title = f"{event_type} at {venue}"

            events.append({
                "title": title,
                "description": description,
                "date": event_date.strftime('%Y-%m-%dT%H:%M:%S'),
                "location": {
                    "type": "Point",
                    "coordinates": [float(longitude), float(latitude)],
                    "city": "Unknown City",
                    "state": "Unknown State",
                    "country": "Unknown Country",
                    "zipCode": "00000"
                },
                "category": category,
                "time": f"{random.randint(1, 12)}:{str(random.randint(0, 59)).zfill(2)} {random.choice(['AM', 'PM'])}",
                "demographics": generate_demographics(),
                "tags": random.sample(categories.keys(), random.randint(1, 3))
            })
        except Exception as e:
            print(f"Error occurred while generating event: {e}")

    return events

main_cities = {
    'New York': 0.5,  # Higher focus on New York
    'London': 0.05,
    'Tokyo': 0.05,
    'Sydney': 0.05,
    'Berlin': 0.05,
    'Johannesburg': 0.05,
    'São Paulo': 0.05,
    'Beijing': 0.05
}

event_data = generate_global_events(1500, main_cities)
event_data = decimal_to_float(event_data)

with open('events.json', 'w') as f:
    json.dump(event_data, f, indent=4)

print("Generated 1500 detailed events with locations primarily around New York and globally.")
