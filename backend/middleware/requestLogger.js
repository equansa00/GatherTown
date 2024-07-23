// backend/middleware/logRequestDetails.js

const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query,
    headers: req.headers,
    userId: req.user ? req.user.id : 'Guest',
    sessionID: req.sessionID ? req.sessionID : 'No session',
  });
  next();
};

module.exports = requestLogger;