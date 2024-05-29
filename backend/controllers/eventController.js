const Event = require('../models/Event');
const { validationResult } = require('express-validator');
const axios = require('axios');
const logger = require('../config/logger');

// Middleware for logging requests
const logRequestDetails = (req) => {
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
};

// Helper functions
const handleNotFound = (res, message) => res.status(404).json({ msg: message });
const handleServerError = (res, error) => {
  console.error('Server Error:', error);
  return res.status(500).json({ error: 'Server error', details: error.message });
};

// Get events with pagination, filtering, keyword search, and date range
exports.getEvents = async (req, res) => {
  logRequestDetails(req);
  try {
    const { lat, lng, page = 0, limit = 10 } = req.query;
    logger.info(`Fetching events with parameters: lat=${lat}, lng=${lng}, page=${page}, limit=${limit}`);

    const events = await Event.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: 10000
        }
      }
    })
      .skip(page * limit)
      .limit(parseInt(limit, 10));

    logger.info(`Fetched ${events.length} events.`);
    res.status(200).json(events);
  } catch (error) {
    logger.error(`Error fetching events: ${error.message}`, error);
    res.status(500).json({ message: error.message });
  }
};

// Get all events without any filtering or pagination
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({});
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

  const { title, description, date, location, category, time, creator, images } = req.body;

  try {
    const event = new Event({ title, description, date, location, category, time, creator, images });
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
  const userId = req.user._id;
  try {
    const event = req.event;
    if (!event.attendees) {
      event.attendees = [];
    }
    if (!event.attendees.includes(userId)) {
      event.attendees.push(userId);
      await event.save();
      res.json({ message: 'RSVP successful', event });
    } else {
      res.json({ message: 'User already RSVPed to this event' });
    }
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
  logRequestDetails(req);
  const { lat, lng, maxDistance = 10000 } = req.query;
  logger.info(`Received request to fetch nearby events with parameters: lat=${lat}, lng=${lng}, maxDistance=${maxDistance}`);
  
  try {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const distance = parseInt(maxDistance, 10);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(distance)) {
      logger.error('Invalid latitude, longitude, or distance parameters');
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

// Get events by zip code
exports.getEventsByZip = async (req, res) => {
  const zip = req.query.zip;

  try {
    const geocodeResponse = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${zip}.json`, {
      params: {
        access_token: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
      },
    });

    if (geocodeResponse.data.features.length === 0) {
      return res.status(404).json({ message: 'Invalid zip code' });
    }

    const location = geocodeResponse.data.features[0].geometry.coordinates;
    const lng = location[0];
    const lat = location[1];

    const events = await Event.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: 10000,
        },
      },
    });

    res.json(events);
  } catch (error) {
    handleServerError(res, error);
  }
};

// Get featured events
exports.getFeaturedEvents = async (req, res) => {
  try {
    const featuredEvents = await Event.find({ isFeatured: true });
    res.json(featuredEvents);
  } catch (error) {
    handleServerError(res, error);
  }
};

// Get random events
exports.getRandomEvents = async (req, res) => {
  const count = parseInt(req.query.count, 10) || 5;
  try {
    const randomEvents = await Event.aggregate([{ $sample: { size: count } }]);
    res.json(randomEvents);
  } catch (error) {
    handleServerError(res, error);
  }
};
