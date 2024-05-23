// backend/routes/eventRoutes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkEventExists, isAuthorized } = require('../helpers/eventHelpers');

// Define validation rules for creating and updating events
const createEventValidation = [
    body('title').not().isEmpty().withMessage('Title cannot be empty'),
    body('description').not().isEmpty().withMessage('Description cannot be empty'),
    body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('location.type').equals('Point').withMessage('Location type must be "Point"'),
    body('location.coordinates').isArray().withMessage('Location coordinates must be an array'),
    body('category').not().isEmpty().withMessage('Category cannot be empty')
];

// Route to find nearby events - this route doesn't require authentication for public access
router.get('/nearby', eventController.getNearbyEvents);

// Other Event CRUD operations
router.post('/', authMiddleware, createEventValidation, eventController.createEvent);
router.get('/', eventController.getEvents);
router.put('/:id', authMiddleware, checkEventExists, isAuthorized, createEventValidation, eventController.updateEvent);
router.delete('/:id', authMiddleware, checkEventExists, isAuthorized, eventController.deleteEvent);
router.post('/:id/rsvp', authMiddleware, checkEventExists, eventController.rsvpToEvent);
router.get('/:id', checkEventExists, eventController.getEventById);

// Log out all configured routes to verify
router.stack.forEach((layer) => {
    if (layer.route) {
        const { path, methods } = layer.route;
        console.log(`Configured route: Path = ${path}, Methods = ${Object.keys(methods).join(', ')}`);
    }
});

module.exports = router;


// // backend/routes/eventRoutes.js
// const express = require('express');
// const { body } = require('express-validator');
// const router = express.Router();
// const eventController = require('../controllers/eventController');

// // Define validation rules for creating and updating events
// const createEventValidation = [
//     body('title').not().isEmpty().withMessage('Title cannot be empty'),
//     body('description').not().isEmpty().withMessage('Description cannot be empty'),
//     body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
//     body('location.type').equals('Point').withMessage('Location type must be "Point"'),
//     body('location.coordinates').isArray().withMessage('Location coordinates must be an array'),
//     body('category').not().isEmpty().withMessage('Category cannot be empty')
// ];

// // Route to find nearby events - added without authMiddleware for testing purposes
// router.get('/nearby', eventController.getNearbyEvents);

// // Other Event CRUD operations
// router.post('/', createEventValidation, eventController.createEvent);  // Normally you'd include authMiddleware here
// router.get('/', eventController.getEvents); 
// router.put('/:id', createEventValidation, eventController.updateEvent); // Normally you'd include authMiddleware here
// router.delete('/:id', eventController.deleteEvent); // Normally you'd include authMiddleware here
// router.post('/:id/rsvp', eventController.rsvpToEvent); // Normally you'd include authMiddleware here
// router.get('/:id', eventController.getEventById); // This can be public or authenticated based on use case

// // Log out all configured routes to verify
// router.stack.forEach((layer) => {
//     if (layer.route) {
//         const { path, methods } = layer.route;
//         console.log(`Configured route: Path = ${path}, Methods = ${Object.keys(methods).join(', ')}`);
//     }
// });

// module.exports = router;





// //backend/routes/eventRoutes.js
// const express = require('express');
// const { body } = require('express-validator');
// const router = express.Router();
// const eventController = require('../controllers/eventController');
// const authMiddleware = require('../middleware/authMiddleware');

// // Define validation rules for creating events
// const createEventValidation = [
//     body('title').not().isEmpty().withMessage('Title cannot be empty'),
//     body('description').not().isEmpty().withMessage('Description cannot be empty'),
//     body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
//     body('location.type').equals('Point').withMessage('Location type must be "Point"'),
//     body('location.coordinates').isArray().withMessage('Location coordinates must be an array'),
//     body('category').not().isEmpty().withMessage('Category cannot be empty')
// ];

// // Event routes using authentication and validation middleware
// router.post('/', authMiddleware, createEventValidation, eventController.createEvent);
// router.get('/', eventController.getEvents); 
// router.put('/:id', authMiddleware, eventController.updateEvent);
// router.delete('/:id', authMiddleware, eventController.deleteEvent);
// router.post('/:id/rsvp', authMiddleware, eventController.rsvpToEvent);
// router.get('/:id', eventController.getEventById);
// router.get('/nearby', async (req, res) => {
//     const { lat, lng } = req.query;
//     try {
//       const events = await Event.find({
//         location: {
//           $near: {
//             $geometry: { type: "Point", coordinates: [ parseFloat(lng), parseFloat(lat) ] },
//             $maxDistance: 10000
//           }
//         }
//       });
//       res.json(events);
//     } catch (error) {
//       console.error('Error fetching nearby events:', error);
//       res.status(500).send('Failed to fetch events.');
//     }
//   });


// module.exports = router;