// /home/equansa00/Desktop/GatherTown/backend/controllers/eventController.js

const axios = require('axios');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const { validationResult } = require('express-validator');
const logger = require('../config/logger');
const cloudinary = require('../config/cloudinary');
const { getDistanceFromLatLonInMiles } = require('../utils/geolocationUtils');
const { geocodeAddress } = require('../utils/geocode');

// Helper functions
const handleNotFound = (res, message) => res.status(404).json({ msg: message });
const handleServerError = (res, error) => {
  logger.error('Server Error:', error);
  return res.status(500).json({ error: 'Server error', details: error.message });
};

// Function to upload image
const uploadImage = async (imagePath) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'events',
    });
    return result.secure_url;
  } catch (error) {
    throw new Error('Image upload failed');
  }
};

const buildFilter = (query) => {
  const filter = {};
  if (query.title) {
    filter.title = new RegExp(query.title, 'i');
  }
  if (query.category) filter.category = new RegExp(query.category, 'i');
  if (query.country) filter['location.country'] = query.country;
  if (query.state) filter['location.state'] = query.state;
  if (query.city) filter['location.city'] = query.city;
  if (query.zipCode) filter['location.zipCode'] = query.zipCode;
  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = new Date(query.startDate);
    if (query.endDate) filter.date.$lte = new Date(query.endDate);
  }
  logger.info(`Constructed filter: ${JSON.stringify(filter)}`);
  return filter;
};

/// Function to get both nearby and international events
exports.getEvents = async (req, res) => {
  try {
    const { latitude, longitude, range = 10000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const nearbyEvents = await Event.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: range // Adjust the distance as needed
        }
      }
    });

    const internationalEvents = await Event.find({
      location: {
        $not: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude]
            },
            $maxDistance: range
          }
        }
      }
    });

    const events = [...nearbyEvents, ...internationalEvents];

    res.status(200).json({
      events,
      totalEvents: events.length,
      page: 0,
      totalPages: 1
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};


// Get all events with optional filtering
exports.getAllEvents = async (req, res) => {
  const { category, country, state, page = 0, limit = 10 } = req.query;

  const filters = {};
  if (category) filters.category = category;
  if (country) filters["location.country"] = country;
  if (state) filters["location.state"] = state;

  try {
    const events = await Event.find(filters)
      .skip(page * limit)
      .limit(parseInt(limit));
    const totalEvents = await Event.countDocuments(filters);
    const totalPages = Math.ceil(totalEvents / limit);
    res.status(200).json({ events, totalEvents, page, totalPages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error });
  }
};

// Function to get all unique categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Event.distinct('category');
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Create Event
exports.createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, date, time, category, location, images, demographics, tags } = req.body;
  const creator = req.user.id;

  try {
    const event = new Event({
      title,
      description,
      date,
      time,
      category,
      location,
      images,
      demographics,
      tags,
      creator
    });

    await event.save();
    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event', error });
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
    const userId = req.user.id;
    const eventId = req.params.id;

    console.log(`RSVP request for event ID: ${eventId} by user ID: ${userId}`);

    const event = await Event.findById(eventId);
    if (!event) {
      console.log('Event not found');
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the event has a creator
    if (!event.creator) {
      console.log('Event creator is missing');
      return res.status(400).json({ message: 'Event creator is missing' });
    }

    if (!event.attendees) {
      event.attendees = [];
    }

    if (!event.attendees.includes(userId)) {
      event.attendees.push(userId);
      await event.save();
      console.log('RSVP successful');
      res.json({ message: 'RSVP successful', event });
    } else {
      res.status(400).json({ message: 'User already RSVPed to this event' });
    }
  } catch (error) {
    console.error('RSVP Error:', error);
    res.status(500).json({ message: 'Failed to RSVP', error: error.message });
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

exports.getRandomNearbyEvents = async (req, res) => {
  const { latitude, longitude, radius = 5000, count = 5 } = req.query;

  try {
    const events = await Event.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          distanceField: "distance",
          maxDistance: parseFloat(radius),
          spherical: true,
          key: "location.coordinates" // Explicitly specify the correct field name indexed with 2dsphere
        }
      },
      { $sample: { size: parseInt(count, 10) } } // Randomly sample the specified number of events
    ]);

    res.json(events);
  } catch (error) {
    console.error('Error fetching random nearby events:', error);
    res.status(500).json({ message: 'Error fetching random nearby events' });
  }
};

// Get events by zip code
exports.getEventsByZip = async (req, res) => {
  const zip = req.query.zip;

  if (!zip) {
    return res.status(400).json({ message: 'Zip code is required' });
  }

  try {
    const { lat, lng } = await geocodeAddress(zip);

    console.log('Geocoded coordinates:', { lat, lng });

    const events = await Event.find({
      'location.coordinates': {
        $geoWithin: {
          $centerSphere: [[lng, lat], 10 / 3963.2], // 10 miles radius
        },
      },
    });

    const eventsWithDistances = events.map(event => {
      const distance = getDistanceFromLatLonInMiles(lat, lng, event.location.coordinates[1], event.location.coordinates[0]);
      return { ...event._doc, distance };
    });

    res.json(eventsWithDistances);
  } catch (error) {
    console.error('Error fetching events by zip:', error);
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

//Get nearby events
exports.getNearbyEvents = async (req, res) => {
  const { latitude, longitude, maxDistance = 5000, limit = 10 } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Latitude and longitude are required" });
  }

  try {
    const events = await Event.find({
      location: {
        $geoWithin: {
          $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], maxDistance / 6378.1]
        }
      }
    }).limit(parseInt(limit));

    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};


// Fetch unique countries
exports.getCountries = async (req, res) => {
  try {
    const countries = await Event.distinct("location.country");
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Fetch unique states/regions based on selected country
exports.getStates = async (req, res) => {
  const { country } = req.query;
  try {
    const states = await Event.distinct("location.state", { "location.country": country });
    res.status(200).json(states);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Fetch unique cities based on selected state/region
exports.getCities = async (req, res) => {
  const { country, state } = req.query;
  try {
    const cities = await Event.distinct("location.city", { "location.country": country, "location.state": state });
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.searchEvents = async (req, res) => {
  try {
    const { country, state, city, streetAddress, zipCode, category, startDate, endDate, title } = req.query;
    const query = {};

    if (country) query["location.country"] = country;
    if (state) query["location.state"] = state;
    if (city) query["location.city"] = city;
    if (streetAddress) query["location.streetAddress"] = { $regex: streetAddress, $options: "i" };
    if (zipCode) query["location.zipCode"] = zipCode;
    if (category) query.category = category;
    if (startDate || endDate) query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
    if (title) query.title = { $regex: title, $options: "i" };

    const events = await Event.find(query);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};