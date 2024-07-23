//home/equansa00/Downloads/GatherTown/backend/middleware/validators/eventValidator.js
const { check, validationResult } = require('express-validator');
const logger = require('../../config/logger'); // Assuming the logger is in config folder

const validateEvent = [
  check('title').notEmpty().withMessage('Title is required'),
  check('description').notEmpty().withMessage('Description is required'),
  check('startDateTime').isISO8601().toDate().withMessage('Invalid start date and time format').bail()
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event start date and time must be in the future');
      }
      return true;
    }),
  check('endDateTime').isISO8601().toDate().withMessage('Invalid end date and time format').bail()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDateTime)) {
        throw new Error('End date and time must be after start date and time');
      }
      return true;
    }),
  check('date').isISO8601().toDate().withMessage('Date must be a valid ISO 8601 date'),
  check('timezone').notEmpty().withMessage('Timezone is required'),
  check('location.type').equals('Point').withMessage('Location type must be Point'),
  check('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Location coordinates must be an array of two numbers').bail()
    .custom(([longitude, latitude]) => {
      if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        throw new Error('Invalid coordinates');
      }
      return true;
    }),
  check('location.addressLine1').notEmpty().withMessage('Street address is required'),
  check('location.street').notEmpty().withMessage('Street address is required'),
  check('location.city').notEmpty().withMessage('City is required'),
  check('location.state').notEmpty().withMessage('State is required'),
  check('location.country').notEmpty().withMessage('Country is required'),
  check('category').notEmpty().withMessage('Category is required'),
  check('subCategory').notEmpty().withMessage('SubCategory is required'),
  check('tags').isArray({ min: 1 }).withMessage('Tags are required and must be an array with at least one tag'),
  check('organizerInfo').notEmpty().withMessage('Organizer info is required'),
  check('capacity').isInt({ gt: 0 }).withMessage('Capacity must be an integer greater than 0'),
  check('time').notEmpty().withMessage('Time is required'), // Adding validation for the time field
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error('Validation errors:', { errors: errors.array() });
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateEvent,
  handleValidationErrors,
};
