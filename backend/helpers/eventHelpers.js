// backend/helpers/eventHelpers.js
const Event = require('../models/Event');

exports.checkEventExists = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    req.event = event; // Store event for downstream use
    next();
  } catch (err) {
    console.error('Error finding event:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.isAuthorized = (req, res, next) => {
  if (req.event.creator.toString() !== req.user._id.toString()) {
    return res.status(401).json({ msg: 'User not authorized' });
  }
  next();
};
