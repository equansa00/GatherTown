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
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
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
  // Check for validation errors first
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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

// RSVP to an event
exports.rsvpToEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Update RSVP logic here, for example, increment a counter or add a user to an RSVP list
    event.rsvpCount = (event.rsvpCount || 0) + 1;
    await event.save();
    
    res.status(200).json({ message: 'RSVP successful', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  const eventId = req.params.id;
  console.log(`Request received to retrieve event with ID: ${eventId}`);

  // Validate the format of the event ID
  if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
    console.warn(`Invalid event ID format: ${eventId}`);
    return res.status(400).json({ msg: 'Invalid ID format. ID must be a 24-character hexadecimal string.' });
  }

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      console.warn(`No event found with ID: ${eventId}`);
      return handleNotFound(res, 'Event not found');
    }
    console.log(`Event retrieved successfully: ${JSON.stringify(event)}`);
    res.json(event);
  } catch (err) {
    console.error(`Error retrieving event with ID: ${eventId}`, err.message);
    handleServerError(res, err.message);
  }
};



// // controllers/eventController.js
// const Event = require('../models/Event');
// const { validationResult } = require('express-validator');

// // Helper function to handle not found errors
// const handleNotFound = (res, message) => res.status(404).json({ msg: message });

// // Helper function to handle unauthorized access
// const handleUnauthorized = (res, message) => res.status(401).json({ msg: message });

// // Helper function to handle server errors
// const handleServerError = (res, error) => {
//   console.error('Server Error:', error);
//   return res.status(500).json({ error: 'Server error' });
// }

// // Get all events
// exports.getEvents = async (req, res) => {
//   try {
//     const events = await Event.find();
//     res.json(events);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching events' });
//   }
// };


// // exports.getEvents = async (req, res) => {
// //   try {
// //     const events = await Event.find().sort({ date: -1 });
// //     console.log("Sending events:", events);
// //     res.json(events);
// //   } catch (err) {
// //     console.error("Failed to fetch events:", err);
// //     handleServerError(res, err.message);
// //   }
// // };

// // Create a new event
// exports.createEvent = async (req, res) => {
//   // Check for validation errors first
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   // Extract fields from req.body
//   const { title, description, date, location, category, time } = req.body;
//   if (!title || !description || !date || !location || !category || !time) {
//     return res.status(400).json({ error: 'Missing one or more required fields' });
//   }

//   const eventData = {
//     title, 
//     description, 
//     date, 
//     location, 
//     category, 
//     time, 
//     creator: req.user.id 
//   }; 

//   console.log('Request Body:', req.body); // Log the entire request body
//   console.log('Event Data:', eventData);

//   try {
//     const event = await Event.create(eventData);
//     console.log("Event created with ID:", event._id);  // Log the ID for verification
//     res.status(201).json({ message: 'Event created successfully', event });
//   } catch (error) {
//     console.error('Error creating event:', error);
//     handleServerError(res, error.message);
//   }
// };

// // Update an event
// exports.updateEvent = async (req, res) => {
//   try {
//     const event = await Event.findById(req.params.id);
//     if (!event) {
//       return handleNotFound(res, 'Event not found');
//     }

//     if (event.creator.toString() !== req.user.id) {
//       return handleUnauthorized(res, 'User not authorized');
//     }

//     const updatedEvent = await Event.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
//     res.json(updatedEvent);
//   } catch (err) {
//     handleServerError(res, err.message);
//   }
// };

// // Delete an event
// exports.deleteEvent = async (req, res) => {
//   try {
//     // First, check if the event exists and the user is authorized to delete it
//     const event = await Event.findById(req.params.id);
//     if (!event) {
//       return handleNotFound(res, 'Event not found');
//     }

//     if (event.creator.toString() !== req.user.id) {
//       return handleUnauthorized(res, 'User not authorized');
//     }

//     // Use findByIdAndDelete to remove the event
//     await Event.findByIdAndDelete(req.params.id);
//     res.status(200).json({ msg: 'Event removed' });
//   } catch (err) {
//     handleServerError(res, err.message);
//   }
// };

// // RSVP to an event
// exports.rsvpToEvent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const event = await Event.findById(id);
//     if (!event) {
//       return res.status(404).json({ message: 'Event not found' });
//     }
    
//     // Update RSVP logic here, for example, increment a counter or add a user to an RSVP list
//     event.rsvpCount = (event.rsvpCount || 0) + 1;
//     await event.save();
    
//     res.status(200).json({ message: 'RSVP successful', event });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // Get event by ID
// exports.getEventById = async (req, res) => {
//   const eventId = req.params.id;
//   console.log(`Request received to retrieve event with ID: ${eventId}`);

//   // Validate the format of the event ID
//   if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
//     console.warn(`Invalid event ID format: ${eventId}`);
//     return res.status(400).json({ msg: 'Invalid ID format. ID must be a 24-character hexadecimal string.' });
//   }

//   try {
//     const event = await Event.findById(eventId);
//     if (!event) {
//       console.warn(`No event found with ID: ${eventId}`);
//       return handleNotFound(res, 'Event not found');
//     }
//     console.log(`Event retrieved successfully: ${JSON.stringify(event)}`);
//     res.json(event);
//   } catch (err) {
//     console.error(`Error retrieving event with ID: ${eventId}`, err.message);
//     handleServerError(res, err.message);
//   }
// };
