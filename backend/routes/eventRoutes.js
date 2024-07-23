///home/equansa00/Downloads/GatherTown/backend/routes/eventRoutes.js
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
  searchEvents,
  getRandomNearbyEvents,
} = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkEventExists, isAuthorized } = require('../helpers/eventHelpers');
const logger = require('../config/logger');
const multer = require('multer');
const { validateEvent, handleValidationErrors } = require('../middleware/validators/eventValidator');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Temporary storage

// Middleware to log request details
const requestLogger = require('../middleware/requestLogger'); // Ensure this is imported correctly

router.use(requestLogger);

// Validation Rules
const eventValidation = [
  body('title').notEmpty().withMessage('Title cannot be empty'),
  body('description').notEmpty().withMessage('Description cannot be empty'),
  body('startDateTime').isISO8601().withMessage('Invalid start date and time format').bail()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event start date and time must be in the future');
      }
      return true;
    }),
  body('endDateTime').isISO8601().withMessage('Invalid end date and time format').bail()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDateTime)) {
        throw new Error('End date and time must be after start date and time');
      }
      return true;
    }),
  body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('timezone').notEmpty().withMessage('Timezone is required'),
  body('location.type').equals('Point').withMessage('Location type must be Point'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Location coordinates must be an array of two numbers').bail()
    .custom(([longitude, latitude]) => {
      if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        throw new Error('Invalid coordinates');
      }
      return true;
    }),
  body('location.addressLine1').notEmpty().withMessage('Street address is required'),
  body('location.street').notEmpty().withMessage('Street address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('location.country').notEmpty().withMessage('Country is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('subCategory').notEmpty().withMessage('SubCategory is required'),
  body('tags').isArray({ min: 1 }).withMessage('Tags are required and must be an array with at least one tag'),
  body('organizerInfo').notEmpty().withMessage('Organizer info is required'),
  body('capacity').isInt({ gt: 0 }).withMessage('Capacity must be an integer greater than 0'),
  body('time').notEmpty().withMessage('Time is required'), // Adding validation for the time field
];

// Public Event Routes
router.get('/nearby', getNearbyEvents);
router.get('/zip', getEventsByZip);
router.get('/featured', getFeaturedEvents);
router.get('/random', getRandomEvents);
router.get('/all', getAllEvents);
router.get('/search', searchEvents);
router.get('/random-nearby', getRandomNearbyEvents);
router.get('/countries', getCountries);
router.get('/states', getStates);
router.get('/cities', getCities);
router.get('/categories', getAllCategories);
router.get('/events', getEvents);
router.get('/', getEvents); // Route for getting all events
router.get('/:id', checkEventExists, getEventById);

// Protected Event Routes (Require Authentication)
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  eventValidation,
  handleValidationErrors,
  createEvent
);
router.put(
  '/:id',
  authMiddleware,
  checkEventExists,
  isAuthorized,
  eventValidation,
  handleValidationErrors,
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
  '/:id/rsvp',
  authMiddleware,
  checkEventExists,
  rsvpToEvent
);

// Add the error handler middleware at the end
const { handleErrors } = require('../middleware/errorHandlers');
router.use(handleErrors);

module.exports = router;













// const express = require('express');
// const { body } = require('express-validator');
// const {
//   getNearbyEvents,
//   getEventsByZip,
//   getFeaturedEvents,
//   getRandomEvents,
//   getAllEvents,
//   getEventById,
//   createEvent,
//   updateEvent,
//   deleteEvent,
//   rsvpToEvent,
//   getCountries,
//   getStates,
//   getCities,
//   getEvents,
//   getAllCategories,
//   searchEvents,
//   getRandomNearbyEvents,
// } = require('../controllers/eventController');
// const authMiddleware = require('../middleware/authMiddleware');
// const { checkEventExists, isAuthorized } = require('../helpers/eventHelpers');
// const logger = require('../config/logger');
// const multer = require('multer');

// const router = express.Router();
// const upload = multer({ dest: 'uploads/' }); // Temp storage

// // Middleware to log request details
// const logRequestDetails = (req, res, next) => {
//   logger.info({
//     method: req.method,
//     path: req.originalUrl,
//     params: req.params,
//     query: req.query,
//     body: req.body,
//     headers: req.headers,
//     userId: req.user ? req.user.id : 'Guest',
//     sessionID: req.sessionID ? req.sessionID : 'No session',
//   });
//   next();
// };

// router.use(logRequestDetails);

// // Validation Rules
// const eventValidation = [
//   body('title').not().isEmpty().withMessage('Title cannot be empty'),
//   body('description').not().isEmpty().withMessage('Description cannot be empty'),
//   body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
//   body('location.street').not().isEmpty().withMessage('Street address is required'),
//   body('location.city').not().isEmpty().withMessage('City is required'),
//   body('location.state').not().isEmpty().withMessage('State is required'),
//   body('location.country').not().isEmpty().withMessage('Country is required'),
//   body('time').not().isEmpty().withMessage('Time is required'),
// ];

// // Public Event Routes
// router.get('/nearby', getNearbyEvents);
// router.get('/zip', getEventsByZip);
// router.get('/featured', getFeaturedEvents);
// router.get('/random', getRandomEvents);
// router.get('/all', getAllEvents);
// router.get('/search', searchEvents);
// router.get('/random-nearby', getRandomNearbyEvents); // Ensure this is correct
// router.get('/countries', getCountries);
// router.get('/states', getStates);
// router.get('/cities', getCities);
// router.get('/categories', getAllCategories);
// router.get('/events', getAllEvents);
// router.get('/', getEvents);
// router.get('/:id', checkEventExists, getEventById);

// // Protected Event Routes (Require Authentication)
// router.post(
//   '/',
//   authMiddleware,
//   upload.single('image'),
//   eventValidation,
//   createEvent
// );
// router.put(
//   '/:id',
//   authMiddleware,
//   checkEventExists,
//   isAuthorized,
//   eventValidation,
//   updateEvent
// );
// router.delete(
//   '/:id',
//   authMiddleware,
//   checkEventExists,
//   isAuthorized,
//   deleteEvent
// );
// router.post(
//   '/:id/rsvp', // Corrected route
//   authMiddleware,
//   checkEventExists,
//   rsvpToEvent
// );

// module.exports = router;


















// const express = require('express');
// const { body } = require('express-validator');
// const {
//   getNearbyEvents,
//   getEventsByZip,
//   getFeaturedEvents,
//   getRandomEvents,
//   getAllEvents,
//   getEventById,
//   createEvent,
//   updateEvent,
//   deleteEvent,
//   rsvpToEvent,
//   getCountries,
//   getStates,
//   getCities,
//   getEvents,
//   getAllCategories,
//   searchEvents,
//   getRandomNearbyEvents,
// } = require('../controllers/eventController');
// const authMiddleware = require('../middleware/authMiddleware');
// const { checkEventExists, isAuthorized } = require('../helpers/eventHelpers');
// const logger = require('../config/logger');
// const multer = require('multer');

// const router = express.Router();
// const upload = multer({ dest: 'uploads/' }); // Temp storage

// // Middleware to log request details
// const logRequestDetails = (req, res, next) => {
//   logger.info({
//     method: req.method,
//     path: req.originalUrl,
//     params: req.params,
//     query: req.query,
//     body: req.body,
//     headers: req.headers,
//     userId: req.user ? req.user.id : 'Guest',
//     sessionID: req.sessionID ? req.sessionID : 'No session',
//   });
//   next();
// };

// router.use(logRequestDetails);

// // Validation Rules
// const eventValidation = [
//   body('title').not().isEmpty().withMessage('Title cannot be empty'),
//   body('description').not().isEmpty().withMessage('Description cannot be empty'),
//   body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
//   body('location.street').not().isEmpty().withMessage('Street address is required'),
//   body('location.city').not().isEmpty().withMessage('City is required'),
//   body('location.state').not().isEmpty().withMessage('State is required'),
//   body('location.country').not().isEmpty().withMessage('Country is required'),
//   body('time').not().isEmpty().withMessage('Time is required'),
// ];

// // Log the controller functions to ensure they're properly imported
// console.log({
//   getNearbyEvents,
//   getEventsByZip,
//   getFeaturedEvents,
//   getRandomEvents,
//   getAllEvents,
//   getEventById,
//   createEvent,
//   updateEvent,
//   deleteEvent,
//   rsvpToEvent,
//   getCountries,
//   getStates,
//   getCities,
//   getEvents,
//   getAllCategories,
//   searchEvents,
//   getRandomNearbyEvents,
// });

// // Public Event Routes
// router.get('/nearby', getNearbyEvents);
// router.get('/zip', getEventsByZip);
// router.get('/featured', getFeaturedEvents);
// router.get('/random', getRandomEvents);
// router.get('/all', getAllEvents);
// router.get('/search', searchEvents);
// router.get('/random-nearby', getRandomNearbyEvents); // Ensure this is correct
// router.get('/countries', getCountries);
// router.get('/states', getStates);
// router.get('/cities', getCities);
// router.get('/categories', getAllCategories);
// router.get('/events', getAllEvents);
// router.get('/', getEvents);
// router.get('/:id', checkEventExists, getEventById);

// // Protected Event Routes (Require Authentication)
// router.post(
//   '/',
//   authMiddleware,
//   upload.single('image'),
//   eventValidation,
//   createEvent
// );
// router.put(
//   '/:id',
//   authMiddleware,
//   checkEventExists,
//   isAuthorized,
//   eventValidation,
//   updateEvent
// );
// router.delete(
//   '/:id',
//   authMiddleware,
//   checkEventExists,
//   isAuthorized,
//   deleteEvent
// );
// router.post(
//   '/:id/rsvp', // Corrected route
//   authMiddleware,
//   checkEventExists,
//   rsvpToEvent
// );

// // Logging configured routes
// router.stack.forEach((layer) => {
//   if (layer.route) {
//     logger.info(`Configured route: Path = ${layer.route.path}, Methods = ${Object.keys(layer.route.methods).join(', ')}`);
//   }
// });

// module.exports = router;


































// const express = require('express');
// const { body } = require('express-validator');
// const {
//   getNearbyEvents,
//   getEventsByZip,
//   getFeaturedEvents,
//   getRandomEvents,
//   getAllEvents,
//   getEventById,
//   createEvent,
//   updateEvent,
//   deleteEvent,
//   rsvpToEvent,
//   getCountries,
//   getStates,
//   getCities,
//   getEvents,
//   getAllCategories,
//   searchEvents,
//   getRandomNearbyEvents,
// } = require('../controllers/eventController');
// const authMiddleware = require('../middleware/authMiddleware');
// const { checkEventExists, isAuthorized } = require('../helpers/eventHelpers');
// const logger = require('../config/logger');
// const multer = require('multer');

// const router = express.Router();
// const upload = multer({ dest: 'uploads/' }); // Temp storage

// // Middleware to log request details
// const logRequestDetails = (req, res, next) => {
//   logger.info({
//     method: req.method,
//     path: req.originalUrl,
//     params: req.params,
//     query: req.query,
//     body: req.body,
//     headers: req.headers,
//     userId: req.user ? req.user.id : 'Guest',
//     sessionID: req.sessionID ? req.sessionID : 'No session',
//   });
//   next();
// };

// router.use(logRequestDetails);

// // Validation Rules
// const eventValidation = [
//   body('title').not().isEmpty().withMessage('Title cannot be empty'),
//   body('description').not().isEmpty().withMessage('Description cannot be empty'),
//   body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
//   body('location.street').not().isEmpty().withMessage('Street address is required'),
//   body('location.city').not().isEmpty().withMessage('City is required'),
//   body('location.state').not().isEmpty().withMessage('State is required'),
//   body('location.country').not().isEmpty().withMessage('Country is required'),
//   body('time').not().isEmpty().withMessage('Time is required'),
// ];

// // Log the controller functions to ensure they're properly imported
// console.log({
//   getNearbyEvents,
//   getEventsByZip,
//   getFeaturedEvents,
//   getRandomEvents,
//   getAllEvents,
//   getEventById,
//   createEvent,
//   updateEvent,
//   deleteEvent,
//   rsvpToEvent,
//   getCountries,
//   getStates,
//   getCities,
//   getEvents,
//   getAllCategories,
//   searchEvents,
//   getRandomNearbyEvents,
// });

// // Public Event Routes
// // router.get('/nearby', getNearbyEvents);
// router.get('/zip', getEventsByZip);
// router.get('/featured', getFeaturedEvents);
// router.get('/random', getRandomEvents);
// router.get('/all', getAllEvents);
// router.get('/search', searchEvents);

// router.get('/events/nearby', getNearbyEvents);

// router.get('/random-nearby', getRandomNearbyEvents); // Ensure this is correct

// router.get('/countries', getCountries);
// router.get('/states', getStates);
// router.get('/cities', getCities);
// router.get('/categories', getAllCategories);

// // Combined Route for Event Listing
// router.get('/events', getAllEvents);
// router.get('/', getEvents);

// router.get('/:id', checkEventExists, getEventById);

// // Protected Event Routes (Require Authentication)
// // Create Event Route
// router.post(
//   '/',
//   authMiddleware,
//   upload.single('image'),
//   eventValidation,
//   createEvent
// );

// router.put(
//   '/:id',
//   authMiddleware,
//   checkEventExists,
//   isAuthorized,
//   eventValidation,
//   updateEvent
// );

// router.delete(
//   '/:id',
//   authMiddleware,
//   checkEventExists,
//   isAuthorized,
//   deleteEvent
// );

// router.post(
//   '/:id/rsvp',  // Corrected route
//   authMiddleware,
//   checkEventExists,
//   rsvpToEvent
// );

// // Logging configured routes
// router.stack.forEach((layer) => {
//   if (layer.route) {
//     logger.info(`Configured route: Path = ${layer.route.path}, Methods = ${Object.keys(layer.route.methods).join(', ')}`);
//   }
// });

// module.exports = router;
