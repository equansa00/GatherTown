const express = require('express');
const { check, validationResult } = require('express-validator');
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules for creating and updating an event
const eventValidationRules = [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description must not be empty').not().isEmpty(),
    check('date', 'Please include a valid date').isISO8601(),
    check('location.coordinates', 'Location coordinates must be provided and be an array').isArray(),
    check('location.coordinates.*', 'Location coordinates must be numbers').isFloat(),
    check('location.type', 'Location type must be "Point"').equals('Point'),
    check('category', 'Category is required').not().isEmpty(),
];

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Routes
router.get('/', eventController.getEvents);
router.post('/', [authMiddleware, eventValidationRules, validate], eventController.createEvent);
router.put('/:id', [authMiddleware, eventValidationRules, validate], eventController.updateEvent);
router.delete('/:id', authMiddleware, eventController.deleteEvent);
router.post('/:id/rsvp', authMiddleware, eventController.rsvpToEvent);
router.get('/:id', eventController.getEventById);

module.exports = router;
