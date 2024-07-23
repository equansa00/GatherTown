// backend/middleware/errorHandlers.js
const logger = require('../config/logger');

const handleErrors = (error, req, res, next) => {
  logger.error('Error:', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    type: error.type,
    errors: error.errors,
  });

  if (error.name === 'ValidationError') {
    const formattedErrors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
    }));
    return res.status(400).json({ errors: formattedErrors });
  } else if (error.type === 'not-found') {
    return res.status(404).json({ msg: error.message });
  } else if (error.type === 'unauthorized') {
    return res.status(401).json({ msg: error.message });
  } else if (error.errors) {
    return res.status(400).json({ errors: error.errors });
  } else {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = { handleErrors };
