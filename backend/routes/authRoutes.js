// Importing required modules
const express = require('express'); // Express.js module for building HTTP servers
const router = express.Router(); // Express.js Router to create modular, mountable route handlers
const { oauth2Client } = require('../utils/sendEmail'); // OAuth2 client for Google APIs

// Route handler for OAuth2 callback
router.get('/oauth2callback', async (req, res) => {
    // Extracting the authorization code from the request query parameters
    const { code } = req.query;

    // If no authorization code is provided, log an error message and return a 400 status (Bad Request)
    if (!code) {
        console.log("No authorization code provided in request.");
        return res.status(400).send('Authorization code missing');
    }

    try {
        // Exchanging the authorization code for tokens
        const { tokens } = await oauth2Client.getToken(code);

        // Setting the tokens as credentials in the OAuth2 client
        oauth2Client.setCredentials(tokens);

        // Logging the access token for debugging
        console.log("Access Token:", tokens.access_token);

        // If a refresh token is received, log it for debugging
        if (tokens.refresh_token) {
            console.log("Refresh Token:", tokens.refresh_token);
        } else {
            console.log("No Refresh Token received with tokens.");
        }

        // Returning a success message
        res.send('Authentication successful! Tokens have been received and set.');
    } catch (error) {
        // Logging any errors that occur during the token exchange process and returning a 500 status (Internal Server Error)
        console.error('Error exchanging code for tokens:', error);
        res.status(500).send('Authentication error');
    }
});

// Exporting the router
module.exports = router;

