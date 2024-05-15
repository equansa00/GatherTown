// Importing required modules
const mongoose = require('mongoose');
const { isAfter, startOfDay } = require('date-fns');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: (value) => isAfter(value, startOfDay(new Date())),
      message: 'Event date must be in the future',
    },
    index: true, // Add index for faster querying
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: [true, 'Location type is required'],
    },
    coordinates: {
      type: [Number],
      required: [true, 'Coordinates are required'],
      validate: {
        validator: ([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
        message: 'Coordinates must be valid longitude and latitude values',
      },
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Music', 'Sports', 'Art', 'Food', 'Tech', 'Recreation', 'Other'], // Example categories
    index: true, // Add index for better performance
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
  }
});

// Ensure the model is properly recompiled
mongoose.model('Event', eventSchema);

eventSchema.pre('save', function (next) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Saving event:', this);
  }
  next();
});

eventSchema.index({ location: '2dsphere' });

eventSchema.statics.findUpcomingEvents = async function () {
  const today = startOfDay(new Date());
  return this.find({ date: { $gte: today } }).sort({ date: 1 });
};

const Event = mongoose.model('Event', eventSchema);

console.log('Event model created');

module.exports = Event;
