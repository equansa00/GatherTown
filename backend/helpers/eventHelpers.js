// backend/helpers/eventHelpers.js
const mongoose = require('mongoose');
const Event = require('../models/Event'); // Ensure correct path to Event model
const { Types: { ObjectId } } = mongoose;

// Helper function to convert values to string safely
const toString = (value) => {
  if (value === undefined || value === null) {
    return '';
  }
  return value.toString();
};

exports.checkEventExists = async (req, res, next) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ msg: 'Invalid Event ID' });
  }

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    req.event = event; // Store the event in request object for later use
    next();
  } catch (error) {
    next(error);
  }
};

exports.isAuthorized = (req, res, next) => {
  // Use toString() here to ensure consistent comparison
  if (req.event.createdBy.toString() !== req.user._id.toString()) { 
    return res.status(401).json({ msg: 'User not authorized' });
  }
  next();
};