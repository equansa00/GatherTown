// backend/controllers/eventController.js
const Event = require('../models/Event');  // Ensure this is only declared once
const { validationResult } = require('express-validator');
const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  const logEntry = {
    level: "info",
    message: "Received HTTP request",
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userId: req.user ? req.user.id : 'Guest',
    sessionID: req.sessionID ? req.sessionID : 'No session',  // Assuming session middleware is used
    userAgent: req.headers['user-agent'],  // Log user agent details
    timestamp: new Date().toISOString()
  };
  console.log(logEntry);
  next();
};

exports.requestLogger = requestLogger;

// Helper functions
const handleNotFound = (res, message) => res.status(404).json({ msg: message });
const handleUnauthorized = (res, message) => res.status(401).json({ msg: message });
const handleServerError = (res, error) => {
  console.error('Server Error:', error);
  return res.status(500).json({ error: 'Server error', details: error });
}

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    if (events.length === 0) {
      return handleNotFound(res, 'No events found');
    }
    res.json(events);
  } catch (error) {
    handleServerError(res, error);
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, date, location, category, time, creator } = req.body;

  try {
    const event = new Event({ title, description, date, location, category, time, creator });
    await event.save();
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    handleServerError(res, error);
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEvent) {
      return handleNotFound(res, 'Event not found');
    }
    res.json(updatedEvent);
  } catch (error) {
    handleServerError(res, error);
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return handleNotFound(res, 'Event not found');
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    handleServerError(res, error);
  }
};

// RSVP to an event
exports.rsvpToEvent = async (req, res) => {
  const userId = req.user._id;  // Ensure this is available from the auth middleware
  try {
    const event = req.event;  // Retrieved from the helper
    // Assuming event has an 'attendees' field which is an array of user IDs
    if (!event.attendees.includes(userId)) {
      event.attendees.push(userId);
      await event.save();
    }
    res.json({ message: 'RSVP successful', event });
  } catch (error) {
    handleServerError(res, error);
  }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return handleNotFound(res, 'Event not found');
    }
    res.json(event);
  } catch (error) {
    handleServerError(res, error);
  }
};

// Get nearby events
exports.getNearbyEvents = async (req, res) => {
  const { lat, lng, maxDistance = 10000 } = req.query;
  logger.info(`Received request to fetch nearby events with parameters: lat=${lat}, lng=${lng}, maxDistance=${maxDistance}`);
  
  try {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const distance = parseInt(maxDistance, 10);

      if (isNaN(latitude) || isNaN(longitude) || isNaN(distance)) {
          return res.status(400).json({ error: 'Invalid latitude, longitude, or distance parameters' });
      }

      const events = await Event.find({
          location: {
              $near: {
                  $geometry: { type: "Point", coordinates: [longitude, latitude] },
                  $maxDistance: distance
              }
          }
      });
      logger.info(`Events fetched successfully: ${events.length} events found.`);
      res.status(200).json(events);
  } catch (error) {
      logger.error("Failed to fetch nearby events", { error: error.message });
      res.status(500).json({ message: "Error fetching nearby events", error });
  }
};

