//home/equansa00/Desktop/GatherTown/controllers/eventController.js
// controllers/eventController.js
const Event = require('../models/Event');
const { validationResult } = require('express-validator');

// Helper function to handle not found errors
const handleNotFound = (res, message) => res.status(404).json({ msg: message });

// Helper function to handle unauthorized access
const handleUnauthorized = (res, message) => res.status(401).json({ msg: message });

// Helper function to handle server errors
const handleServerError = (res, error) => {
  console.error('Server Error:', error);
  return res.status(500).json({ error: 'Server error' });
}

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (err) {
    handleServerError(res, err.message);
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.user || !req.user.id) {
    return handleUnauthorized(res, 'User not authenticated');
  }

  const { title, description, date, location, category } = req.body;
  const eventData = { title, description, date, location, category, creator: req.user.id };

  try {
    const event = await Event.create(eventData);
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    handleServerError(res, error.message);
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return handleNotFound(res, 'Event not found');
    }

    if (event.creator.toString() !== req.user.id) {
      return handleUnauthorized(res, 'User not authorized');
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(updatedEvent);
  } catch (err) {
    handleServerError(res, err.message);
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return handleNotFound(res, 'Event not found');
    }

    if (event.creator.toString() !== req.user.id) {
      return handleUnauthorized(res, 'User not authorized');
    }

    await event.remove();
    res.json({ msg: 'Event removed' });
  } catch (err) {
    handleServerError(res, err.message);
  }
};
