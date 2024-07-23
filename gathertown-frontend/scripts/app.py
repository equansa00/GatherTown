import os
import requests
from flask import Flask, request, redirect, jsonify, session
from flask_pymongo import PyMongo
from flask_session import Session
import redis
import logging

app = Flask(__name__)
app.secret_key = os.urandom(24)

# MongoDB Configuration 
app.config["MONGO_URI"] = "mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority"
mongo = PyMongo(app, uri=app.config["MONGO_URI"])  # Pass URI to PyMongo

# Redis Configuration
redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
redis_client = redis.from_url(redis_url)

# Session configuration (using Redis)
app.config['SESSION_TYPE'] = 'redis'
app.config['SESSION_REDIS'] = redis_client
app.config['SESSION_USE_SIGNER'] = True  
app.config['SESSION_PERMANENT'] = True

Session(app)

# Eventbrite OAuth settings
EVENTBRITE_OAUTH_URL = "https://www.eventbrite.com/oauth/authorize"
EVENTBRITE_TOKEN_URL = "https://www.eventbrite.com/oauth/token"
CLIENT_ID = 'OR4HHI6IPIGPBSOYB7'
CLIENT_SECRET = 'SEKPNJPE4FD2H3X6VHHTEU55BIPFLHRNLGZADLC4XPBDJJ3MDT'
REDIRECT_URI = "https://222e-108-54-243-217.ngrok-free.app/callback"
EVENTBRITE_API_BASE_URL = "https://www.eventbriteapi.com/v3/"

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def get_organization_id(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    url = f"{EVENTBRITE_API_BASE_URL}users/me/organizations/"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        organizations = response.json()
        logging.debug(f"Organizations fetched: {organizations}")
        return organizations['organizations'][0]['id']  # Assuming you take the first organization
    else:
        logging.error("Could not fetch organization ID")
        return None

@app.route('/')
def home():
    return 'Welcome to the Eventbrite OAuth Test'

@app.route('/authorize')
def authorize():
    auth_url = f"{EVENTBRITE_OAUTH_URL}?response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}"
    return redirect(auth_url)

@app.route('/callback')
def callback():
    """Handles the OAuth callback from Eventbrite."""
    logging.debug(f"Session data before callback: {dict(session)}")

    error = request.args.get('error', '')
    if error:
        logging.error(f"Authorization failed: {error}")
        return jsonify({"error": error}), 400

    code = request.args.get('code')
    if not code:
        logging.error("Authorization failed: No code received")
        return jsonify({"error": "No authorization code received"}), 400

    token_data = get_access_token(code)
    if 'error' in token_data:
        logging.error(f"Error obtaining access token: {token_data['error']}")
        return jsonify(token_data), 400

    access_token = token_data['access_token']
    with open('access_token.txt', 'w') as f:
        f.write(access_token)
    logging.debug(f"Access token stored in file: {access_token}")

    session['access_token'] = access_token
    logging.debug(f"Access token stored in session: {session['access_token']}")

    organization_id = get_organization_id(access_token)
    if organization_id:
        session['organization_id'] = organization_id
    logging.debug(f"Session data after callback: {dict(session)}")
    return redirect('/session_data')

def get_access_token(code):
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
    }
    response = requests.post(EVENTBRITE_TOKEN_URL, data=data)

    if response.status_code == 200:
        logging.debug(f"Access token response status: {response.status_code}")
        logging.debug(f"Access token response data: {response.json()}")
        return response.json()
    else:
        try:
            error_message = response.json().get("error_description", "Unknown error")
        except ValueError:
            error_message = response.text
        logging.error(f"Error obtaining access token: {error_message}")
        return {"error": error_message}

@app.route('/fetch_events')
def fetch_events():
    """Fetches events based on location and limits results to 3 events."""
    location = request.args.get('location', 'New York')
    within = request.args.get('within', '50km')

    logging.debug(f"Session data at fetch_events start: {dict(session)}")

    access_token = session.get('access_token')
    if not access_token:
        logging.debug("Access token not found in session, reading from file")
        try:
            with open('access_token.txt', 'r') as f:
                access_token = f.read().strip()
        except FileNotFoundError:
            logging.error("Access token file not found")
            return jsonify({"error": "Access token is missing"}), 400

    logging.debug(f"Access token used: {access_token}")
    logging.debug(f"Session data at fetch_events after getting access_token: {dict(session)}")

    if not access_token:
        logging.error("Access token is missing from session")
        return jsonify({"error": "Access token is missing"}), 400

    organization_id = session.get('organization_id')
    if not organization_id:
        logging.error("Organization ID is missing from session")
        return jsonify({"error": "Organization ID is missing"}), 400

    events_data = get_events(location, within, access_token, organization_id)

    if "error" in events_data:
        logging.error(f"Error fetching events: {events_data['error']}")
        return jsonify(events_data), 500
    else:
        logging.debug(f"Fetched events: {events_data}")
        return jsonify({"status": "success", "events": events_data})

def get_events(location, within, access_token, organization_id):
    """Fetches events using the provided access token."""
    headers = {"Authorization": f"Bearer {access_token}"}
    url = f"{EVENTBRITE_API_BASE_URL}organizations/{organization_id}/events/"
    logging.debug(f"Fetching events with URL: {url}")

    try:
        response = requests.get(url, headers=headers)
        logging.debug(f"Event fetch response status: {response.status_code}")
        logging.debug(f"Event fetch response data: {response.json()}")

        response.raise_for_status()
        events_data = response.json()

        # Check if Eventbrite returned an error
        if 'error' in events_data:
            logging.error(f"Eventbrite API Error: {events_data['error_description']}")
            return {"error": events_data['error_description']}  # Return the error message

        # Extract event details as before
        events_details = []
        for event in events_data.get('events', []):
            event_details = {
                "eventId": event["id"],
                "title": event["name"]["text"],
                "description": event.get("description", {}).get("text", ""),
                "startDateTime": event["start"]["local"],
                "endDateTime": event["end"]["local"],
                "timezone": event["start"]["timezone"],
                "url": event["url"],
                # ... other details you want to include
            }
            events_details.append(event_details)

        return events_details

    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching events from Eventbrite: {e}")
        return {"error": "Error fetching events"}

@app.route('/session_data')
def session_data():
    """Endpoint to check session data for debugging."""
    logging.debug(f"Session data: {dict(session)}")
    return jsonify(dict(session))

if __name__ == '__main__':
    app.run(debug=True, port=5000)














# Instructions to check the session data and troubleshoot the issue step-by-step:

# Authorize with Eventbrite:
# 1. Open your browser and go to http://127.0.0.1:5000/authorize.
# 2. Complete the OAuth flow by logging in to Eventbrite and authorizing the application.

# Check Session Data:
# 1. After successfully authorizing, visit http://127.0.0.1:5000/session_data to verify the session contents.
# 2. You should see the access token stored in the session.

# Fetch Events:
# 1. After verifying that the session contains the access token, visit http://127.0.0.1:5000/fetch_events?location=New+York&within=50km to fetch events.


