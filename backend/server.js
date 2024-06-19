// backend/server.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const { connectDB } = require('./db');
const { handleErrors } = require('./middleware/errorHandlers');
const logRequestDetails = require('./middleware/logRequestDetails');
const logger = require('./config/logger');

// Load environment variables
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: path.join(__dirname, '.env.production') });
} else {
  dotenv.config({ path: path.join(__dirname, '.env.development') });
}

const app = express();

// Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.use('/api/', authenticateToken);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://gathertown-frontend.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Use the request logging middleware
app.use(logRequestDetails);

const envVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'MAPBOX_ACCESS_TOKEN', 'EMAIL_USER', 'EMAIL_PASS', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
envVars.forEach(env => {
  if (process.env[env]) {
    console.log(`${env} loaded successfully:`, env === 'JWT_SECRET' || env === 'JWT_REFRESH_SECRET' ? '[HIDDEN]' : process.env[env]);
  } else {
    console.error(`Error: Missing ${env}`);
  }
});

console.log('Database URI:', process.env.MONGO_URI);
console.log('JWT Secret:', process.env.JWT_SECRET);
console.log('JWT Refresh Secret:', process.env.JWT_REFRESH_SECRET);
console.log('Mapbox Access Token:', process.env.MAPBOX_ACCESS_TOKEN);

connectDB();
console.log('Connected to MongoDB.');

const routeMiddlewares = [
  { path: '/api/users', middleware: userRoutes },
  { path: '/api/events', middleware: eventRoutes },
];

routeMiddlewares.forEach(({ path, middleware }) => {
  if (typeof middleware === 'function' || Array.isArray(middleware)) {
    console.log(`Adding middleware for path: ${path}`);
    app.use(path, middleware);
  } else {
    console.error(`Invalid middleware for path: ${path}`);
  }
});

app.use(handleErrors);

console.log('Routes set up.');

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 10000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;

