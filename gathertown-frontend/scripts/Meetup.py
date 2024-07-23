import os
import requests
from flask import Flask, request, redirect, session, jsonify
import logging
from flask_session import Session

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Session configuration
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = './.flask_session'
app.config['SESSION_PERMANENT'] = True
Session(app)

# Meetup OAuth settings
MEETUP_OAUTH_URL = "https://secure.meetup.com/oauth2/authorize"
MEETUP_TOKEN_URL = "https://secure.meetup.com/oauth2/access"
CLIENT_ID = 'YOUR_MEETUP_CLIENT_ID'
CLIENT_SECRET = 'YOUR_MEETUP_CLIENT_SECRET'
REDIRECT_URI = "https://a2dd-108-54-243-217.ngrok-free.app/callback"
MEETUP_API_BASE_URL = "https://api.meetup.com/graphql"

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

@app.route('/')
def home():
    return 'Welcome to the Meetup API Test'

@app.route('/authorize')
def authorize():
    auth_url = f"{MEETUP_OAUTH_URL}?client_id={CLIENT_ID}&response_type=code&redirect_uri={REDIRECT_URI}&scope=basic"
    return redirect(auth_url)

@app.route('/callback')
def callback():
    code = request.args.get("code")
    if not code:
        return "Authorization failed: No code provided", 400

    token_data = get_access_token(code)
    if 'error' in token_data:
        return jsonify(token_data), 500 

    session['meetup_token'] = token_data['access_token']
    logging.debug(f"Session data after storing token: {session}")
    return jsonify({"status": "success", "message": "Access token obtained", "access_token": token_data['access_token']})

def get_access_token(code):
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI,
        "code": code
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    response = requests.post(MEETUP_TOKEN_URL, data=data, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        try:
            error_message = response.json().get("error_description", "Unknown error")
        except ValueError:
            error_message = response.text
        return {"error": error_message}

@app.route('/fetch_meetup_events')
def fetch_meetup_events():
    logging.debug(f"Session data at start of fetch_meetup_events: {session}") 
    access_token = session.get('meetup_token')

    logging.debug(f"Fetched access token: {access_token}") 
    
    if not access_token:
        logging.error("No access token found in session!") 
        return "Not authorized", 401

    query = """
    {
      self {
        events {
          edges {
            node {
              title
              description
              dateTime
              venue {
                name
                address
              }
            }
          }
        }
      }
    }
    """
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.post(MEETUP_API_BASE_URL, json={'query': query}, headers=headers)
    
    try:
        response.raise_for_status()
        events = response.json()['data']['self']['events']['edges']
        logging.info(f"Successfully fetched events from Meetup.")
        return jsonify({"events": events})
    except requests.exceptions.HTTPError as e:
        logging.error(f"HTTP Error fetching events from Meetup: {e.response.text}")
        return jsonify({"error": e.response.text}), e.response.status_code
    except requests.RequestException as e:
        logging.error(f"Error fetching events from Meetup: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
