const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

// Define validation rules for creating events
const createEventValidation = [
    body('title').not().isEmpty().withMessage('Title cannot be empty'),
    body('description').not().isEmpty().withMessage('Description cannot be empty'),
    body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('location.type').equals('Point').withMessage('Location type must be "Point"'),
    body('location.coordinates').isArray().withMessage('Location coordinates must be an array'),
    body('category').not().isEmpty().withMessage('Category cannot be empty')
];

// Event routes using authentication and validation middleware
router.post('/', authMiddleware, createEventValidation, eventController.createEvent);
router.get('/', authMiddleware, eventController.getEvents); // Added this line to handle GET requests
router.put('/:id', authMiddleware, eventController.updateEvent); // Removed 'events' from the path as it's redundant
router.delete('/:id', authMiddleware, eventController.deleteEvent); // Removed 'events' from the path as it's redundant

module.exports = router;
