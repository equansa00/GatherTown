#gathertown-frontend/scripts/eventbrite.py
import requests
import logging

EVENTBRITE_API_KEY = 'OR4HHI6IPIGPBSOYB7'

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
        response = requests.get(base_url, headers=headers, params=params)
        response.raise_for_status()
        events = response.json().get('events', [])
        return events
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching events from Eventbrite: {e}")
        return []

events = fetch_events_from_eventbrite()
for event in events:
    print(event['name']['text'], event['start']['local'])
