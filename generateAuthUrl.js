///home/equansa00/Desktop/GatherTown/generateAuthUrl.js
require('dotenv').config(); // To load the environment variables from .env file
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

const scopes = [
    'https://www.googleapis.com/auth/gmail.send'
];

const url = oauth2Client.generateAuthUrl({    
    access_type: 'offline', 
    scope: scopes,
    response_type: 'code',  
    prompt: 'consent' // Force re-consent
});

console.log("Visit this URL to initiate the auth flow:", url);
