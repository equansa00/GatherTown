//home/equansa00/Desktop/GatherTown/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const app = express();
const { connectDB } = require('./db');
const eventController = require('./controllers/eventController');
const eventRoutes = require('./routes/eventRoutes');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./config/config');

app.use(express.json());

// Middleware to log all requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.path}`);
    next();
});

// Middleware to log request headers
const logRequestHeaders = (req, res, next) => {
    console.log('Request Headers:', req.headers);
    next();
};

// Apply middleware to all routes
app.use(logRequestHeaders);


// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

app.post('/api/events', verifyToken, (req, res) => {
    // Logic to create event goes here
    console.log('Request Body:', req.body);
    // Example logic to create an event
    const eventData = req.body;
    // Add logic to save eventData to the database
    res.status(201).json({ message: 'Event created successfully', event: eventData });
});


// Setup body parser middleware to handle post requests
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // Handle URL-encoded bodies
console.log('Middlewares set up.');

// Load and log environment variables
console.log('Loading and verifying environment variables...');
const envVars = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_ID', 'CLIENT_SECRET', 'REDIRECT_URI', 'REFRESH_TOKEN'];
envVars.forEach(env => {
    if (process.env[env]) {
        console.log(`${env} loaded successfully:`, env === 'CLIENT_SECRET' || env === 'REFRESH_TOKEN' ? '[HIDDEN]' : process.env[env]);
    } else {
        console.error(`Error: Missing ${env}`);
    }
});

console.log("Loaded refresh token:", process.env.REFRESH_TOKEN);

// Configure OAuth2 client
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);
const scopes = ['https://www.googleapis.com/auth/gmail.send'];
const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
});
console.log("Visit this URL to authorize the app:", authUrl);
console.log("OAuth Redirect URI:", process.env.REDIRECT_URI);

// Connect to MongoDB
connectDB();
console.log('Connected to MongoDB.');

// Setup routes
console.log('Setting up routes...');
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
console.log('Routes set up.');

// OAuth2 callback handler
app.get('/oauth2callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        console.error('Authorization code not received');
        return res.status(400).send('Authorization code missing');
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        console.log('OAuth tokens received and set successfully');

        console.log("Access Token:", tokens.access_token);
        console.log("Refresh Token received and set:", tokens.refresh_token);  // Important: Consider this for initial setup only

        res.send('Authentication successful, tokens received.');
    } catch (error) {
        console.error('Error exchanging OAuth code for tokens:', error);
        res.status(500).send('Authentication error');
    }
});

// Define routes
// Route to get all events
app.get('/api/events', eventController.getEvents);

// Route to create a new event
app.post('/api/events', eventController.createEvent);

// Route to update an event
app.put('/api/events/:id', eventController.updateEvent);

// Route to delete an event
app.delete('/api/events/:id', eventController.deleteEvent);

// Catch-all for unhandled routes
app.use((req, res) => {
    console.error(`Endpoint ${req.path} not found`);
    res.status(404).send('Endpoint not found');
});

// Catch-all for unhandled routes
app.use((req, res) => {
    console.error(`Endpoint ${req.path} not found`);
    res.status(404).send('Endpoint not found');
});

// Start the server
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
