// backend/controllers/eventController.js
const Event = require('../models/Event');  // Ensure this is only declared once
const { validationResult } = require('express-validator');

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
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return handleNotFound(res, 'Event not found');
    }
    // Add the RSVP logic here, e.g., adding the user to the event's attendees
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
  const { lat, lng, distance = 10000 } = req.query;
  console.log(`Querying for events near: ${lat}, ${lng} within ${distance} meters`);
  try {
      const events = await Event.find({
          location: {
              $near: {
                  $geometry: { type: "Point", coordinates: [ parseFloat(lng), parseFloat(lat) ] },
                  $maxDistance: parseInt(distance)
              }
          }
      });
      console.log(`Found ${events.length} events`);
      res.json(events);
  } catch (error) {
      console.error('Error fetching nearby events:', error);
      res.status(500).send('Failed to fetch events.');
  }
};

