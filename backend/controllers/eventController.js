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
  // Check for validation errors first
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Extract fields from req.body
  const { title, description, date, location, category, time } = req.body;
  if (!title || !description || !date || !location || !category || !time) {
    return res.status(400).json({ error: 'Missing one or more required fields' });
  }

  const eventData = {
    title, 
    description, 
    date, 
    location, 
    category, 
    time, 
    creator: req.user.id 
  }; 

  console.log('Request Body:', req.body); // Log the entire request body
  console.log('Event Data:', eventData);

  try {
    const event = await Event.create(eventData);
    console.log("Event created with ID:", event._id);  // Log the ID for verification
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Error creating event:', error);
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
    // First, check if the event exists and the user is authorized to delete it
    const event = await Event.findById(req.params.id);
    if (!event) {
      return handleNotFound(res, 'Event not found');
    }

    if (event.creator.toString() !== req.user.id) {
      return handleUnauthorized(res, 'User not authorized');
    }

    // Use findByIdAndDelete to remove the event
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: 'Event removed' });
  } catch (err) {
    handleServerError(res, err.message);
  }
};
