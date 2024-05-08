//home/equansa00/Desktop/GatherTown/models/Event.js
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
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Music', 'Sports', 'Art', 'Food', 'Tech', 'Other'],
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
  }
});

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
module.exports = Event;
