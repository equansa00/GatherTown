require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const { connectDB } = require('./db');
const handleErrors = require('./middleware/errorHandlers');
const logger = require('./config/logger');

const app = express();

// List of allowed origins
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];

// CORS middleware setup
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Middleware setup
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to log all requests
app.use((req, res, next) => {
    logger.info({
        method: req.method,
        path: req.originalUrl,
        params: req.params,
        query: req.query,
        body: req.body,
        headers: req.headers,
        userId: req.user ? req.user.id : 'Guest',
        sessionID: req.sessionID ? req.sessionID : 'No session',
    });
    next();
});

// Load and log environment variables
console.log('Loading and verifying environment variables...');
const envVars = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_ID', 'CLIENT_SECRET', 'REDIRECT_URI', 'REFRESH_TOKEN', 'GOOGLE_MAPS_API_KEY'];
envVars.forEach(env => {
    if (process.env[env]) {
        console.log(`${env} loaded successfully:`, env === 'CLIENT_SECRET' || env === 'REFRESH_TOKEN' ? '[HIDDEN]' : process.env[env]);
    } else {
        console.error(`Error: Missing ${env}`);
    }
});

console.log('Database URI:', process.env.MONGO_URI);
console.log('JWT Secret:', process.env.JWT_SECRET);
console.log('Google Maps API Key:', process.env.GOOGLE_MAPS_API_KEY);

// Connect to MongoDB
connectDB();
console.log('Connected to MongoDB.');

// Setup routes
console.log('Setting up routes...');
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use(handleErrors);
console.log('Routes set up.');

// Start the server
if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;

