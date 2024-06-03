const mongoose = require('mongoose');
const { isAfter, startOfDay } = require('date-fns');

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: ([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
      message: 'Coordinates must be valid longitude and latitude values',
    },
  },
  streetAddress: String,
  city: {
    type: String,
    required: [true, 'City is required']
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  zipCode: {
    type: String,
    required: [true, 'Zip Code is required']
  },
  country: {
    type: String,
    required: [true, 'Country is required']
  },
}, { _id: false });

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
    index: true,
  },
  location: locationSchema,
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Music', 'Sports', 'Art', 'Food', 'Tech', 'Recreation', 'Other'],
    index: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }, // Not required
  isFeatured: {
    type: Boolean,
    default: false,
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
  },
  images: [{
    type: String,
    required: true,
  }],
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
});

eventSchema.index({ location: '2dsphere' });

eventSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('date')) {
    if (!isAfter(this.date, startOfDay(new Date()))) {
      return next(new Error('Event date must be in the future'));
    }
  }
  next();
});

eventSchema.statics.findUpcomingEvents = async function () {
  const today = startOfDay(new Date());
  return this.find({ date: { $gte: today } }).sort({ date: 1 });
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
