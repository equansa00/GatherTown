const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkEventExists, isAuthorized } = require('../helpers/eventHelpers');
const logger = require('../config/logger');

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
  body('location.type').equals('Point').withMessage('Location type must be "Point"'),
  body('location.coordinates').isArray().withMessage('Location coordinates must be an array'),
  body('category').not().isEmpty().withMessage('Category cannot be empty'),
];

// Public Event Routes
router.get('/nearby', eventController.getNearbyEvents);
router.get('/byZip', eventController.getEventsByZip);
router.get('/featured', eventController.getFeaturedEvents);
router.get('/random', eventController.getRandomEvents);
router.get('/all', eventController.getAllEvents); 
router.get('/:id', checkEventExists, eventController.getEventById);

// Protected Event Routes (Require Authentication)
router.post('/', authMiddleware, eventValidation, eventController.createEvent);
router.put('/:id', authMiddleware, checkEventExists, isAuthorized, eventValidation, eventController.updateEvent);
router.delete('/:id', authMiddleware, checkEventExists, isAuthorized, eventController.deleteEvent);
router.post('/:id/rsvp', authMiddleware, checkEventExists, eventController.rsvpToEvent);

// Combined Route for Event Listing
router.get(['/events', '/'], eventController.getEvents);

// Logging configured routes
router.stack.forEach((layer) => {
  if (layer.route) {
    logger.info(`Configured route: Path = ${layer.route.path}, Methods = ${Object.keys(layer.route.methods).join(', ')}`);
  }
});

module.exports = router;
