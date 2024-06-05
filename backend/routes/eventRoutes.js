const express = require('express');
const { body } = require('express-validator');
const {
  getNearbyEvents,
  getEventsByZip,
  getFeaturedEvents,
  getRandomEvents,
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpToEvent,
  getCountries,
  getStates,
  getCities,
  getEvents,
  getAllCategories,
  searchEvents
} = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkEventExists, isAuthorized } = require('../helpers/eventHelpers');
const logger = require('../config/logger');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Temp storage

// Middleware to log request details
const logRequestDetails = (req, res, next) => {
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
};

router.use(logRequestDetails);

// Validation Rules
const eventValidation = [
  body('title').not().isEmpty().withMessage('Title cannot be empty'),
  body('description').not().isEmpty().withMessage('Description cannot be empty'),
  body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('location.street').not().isEmpty().withMessage('Street address is required'),
  body('location.city').not().isEmpty().withMessage('City is required'),
  body('location.state').not().isEmpty().withMessage('State is required'),
  body('location.country').not().isEmpty().withMessage('Country is required'),
  body('time').not().isEmpty().withMessage('Time is required'),
];

// Public Event Routes
router.get('/nearby', getNearbyEvents);
router.get('/zip', getEventsByZip);
router.get('/featured', getFeaturedEvents);
router.get('/random', getRandomEvents);
router.get('/all', getAllEvents);
router.get('/search', searchEvents); 

// Specific routes before the parameterized route
router.get('/events/nearby', getNearbyEvents);

router.get('/countries', getCountries);
router.get('/states', getStates);
router.get('/cities', getCities);
router.get('/categories', getAllCategories);

// Combined Route for Event Listing
router.get('/events', getAllEvents);
router.get('/', getEvents);

router.get('/:id', checkEventExists, getEventById);

// Protected Event Routes (Require Authentication)
// Create Event Route
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  eventValidation,
  createEvent
);

router.put(
  '/:id',
  authMiddleware,
  checkEventExists,
  isAuthorized,
  eventValidation,
  updateEvent
);

router.delete(
  '/:id',
  authMiddleware,
  checkEventExists,
  isAuthorized,
  deleteEvent
);

router.post(
  '/:id/rsvp',  // Corrected route
  authMiddleware,
  checkEventExists,
  rsvpToEvent
);

// Logging configured routes
router.stack.forEach((layer) => {
  if (layer.route) {
    logger.info(`Configured route: Path = ${layer.route.path}, Methods = ${Object.keys(layer.route.methods).join(', ')}`);
  }
});

module.exports = router;
