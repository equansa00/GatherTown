import requests
import logging
import secrets
from flask import Flask, request, redirect, session
import urllib.parse
import os

# Detailed logging setup
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("oauth_debug.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your_secret_key')  # Set a secret key for session management

# Use environment variables or secure vault for sensitive information
client_id = os.getenv('TICKETMASTER_CLIENT_ID', '1W3s5cOb6rYlgJWO2rBSK3rp3QBF9jGG')
client_secret = os.getenv('TICKETMASTER_CLIENT_SECRET', 'oAXI6YzvIGdb3cnc')
redirect_uri = 'http://108.54.243.217:3000/callback'  # Use IP, not localhost

@app.route('/')
def home():
    state = secrets.token_urlsafe(16)  # Generate a random state
    session['oauth_state'] = state  # Store state in the session
    encoded_redirect_uri = urllib.parse.quote(redirect_uri, safe='')
    redirect_url = f'https://app.ticketmaster.com/oauth/authorize?response_type=code&client_id={client_id}&redirect_uri={encoded_redirect_uri}&state={state}'
    logger.info(f"Home route: Redirecting to URL: {redirect_url} (redirect_uri={redirect_uri}, state={state})")
    return redirect(redirect_url)

@app.route('/callback')
def callback():
    error = request.args.get('error')
    if error:
        error_description = request.args.get('error_description', 'Unknown error')
        logger.error(f"OAuth Error: {error}: {error_description}")
        return f"OAuth Error: {error}: {error_description}", 400

    code = request.args.get('code')
    logger.debug(f"Callback received: code={code}, full query: {request.query_string}")

    # Verify state parameter
    returned_state = request.args.get('state')
    if returned_state != session.pop('oauth_state', None):  # Remove state from session after use
        logger.error("State parameter mismatch!")
        return "State parameter mismatch", 400

    if code:
        # ... (token exchange logic is the same)

        if response.status_code == 200:
            try:
                token_data = response.json()
                access_token = token_data.get('access_token')
                logger.info(f"OAuth Access Token: {access_token}")
                session['access_token'] = access_token  # Store access token in session
                return f"Access Token: {access_token}" 
            except (ValueError, KeyError) as e:
                logger.error(f"Invalid or missing data in token response: {e}")
                return "Invalid token response", 400
        else:
            logger.error(f"Failed to get token: {response.status_code} - {response.text}")
            return f"Failed to get token (HTTP {response.status_code})", 400

    else:
        logger.warning("No authorization code received from Ticketmaster.")
        return "Authorization failed: No code received.", 400

if __name__ == '__main__':
    logger.info("Starting Flask app on http://127.0.0.1:3000")
    app.run(host='127.0.0.1', port=3000)


























# import requests
# from flask import Flask, request, redirect
# import urllib.parse

# app = Flask(__name__)

# # Replace these values with your application's details
# client_id = '1W3s5cOb6rYlgJWO2rBSK3rp3QBF9jGG'
# client_secret = 'oAXI6YzvIGdb3cnc'
# redirect_uri = 'http://localhost:3000/callback'

# @app.route('/')
# def home():
#     encoded_redirect_uri = urllib.parse.quote(redirect_uri, safe='')
#     redirect_url = f'https://app.ticketmaster.com/oauth/authorize?response_type=code&client_id={client_id}&redirect_uri={encoded_redirect_uri}'
#     print(f"Home Route: Redirecting to URL: {redirect_url}")
#     return redirect(redirect_url)

# @app.route('/callback')
# def callback():
#     print("Callback Route: Received request.")
#     code = request.args.get('code')
#     print(f"Callback Route: Authorization code received: {code}")

#     if code:
#         token_url = 'https://app.ticketmaster.com/oauth/token'
#         payload = {
#             'grant_type': 'authorization_code',
#             'code': code,
#             'redirect_uri': redirect_uri,
#             'client_id': client_id,
#             'client_secret': client_secret
#         }
#         print(f"Token Request Payload: {payload}")
#         response = requests.post(token_url, data=payload)
#         print(f"Token Response Status Code: {response.status_code}")
#         print(f"Token Response Headers: {response.headers}")
#         print(f"Token Response Text: {response.text}")

#         try:
#             response_json = response.json()
#             token = response_json.get('access_token')
#             if token:
#                 print(f"Callback Route: OAuth Token received: {token}")
#                 return f"OAuth Token: {token}"
#             else:
#                 print("Callback Route: Failed to obtain OAuth token.")
#                 return f"Failed to obtain OAuth token: {response_json}", 400
#         except Exception as e:
#             print(f"Callback Route: Error parsing response JSON: {e}")
#             return f"Error parsing response JSON: {e}", 400
#     else:
#         print("Callback Route: No authorization code received.")
#         return "No authorization code received", 400

# if __name__ == '__main__':
#     app.run(port=3000)

