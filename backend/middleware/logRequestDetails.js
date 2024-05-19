// backend/middleware/logRequestDetails.js

module.exports = function logRequestDetails(req, res, next) {
    console.log(`Request received - Path: ${req.path}, Method: ${req.method}, Body: ${JSON.stringify(req.body)}, Headers: ${JSON.stringify(req.headers)}`);
    next();
};
