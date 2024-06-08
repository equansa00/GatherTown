const mongoose = require('mongoose');
const { isAfter, startOfDay } = require('date-fns');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    index: true, // Ensure indexing
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
  time: {
    type: String,
    required: [true, 'Time is required'],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: [true, 'Location type is required'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: [true, 'Coordinates are required'],
      validate: {
        validator: ([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
        message: 'Coordinates must be valid longitude and latitude values',
      },
      index: '2dsphere',
    },
    street: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      index: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      index: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      index: true,
    },
    zipCode: {
      type: String,
      index: true,
    },
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Music', 'Sports', 'Art', 'Food', 'Tech', 'Recreation', 'Other'],
    index: true,
  },
  demographics: {
    ageGroup: String,
    interests: [String],
  },
  tags: [String],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  images: [{
    type: String,
    required: true,
  }],
  isFeatured: {
    type: Boolean,
    default: false,
  },
});

eventSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('date')) {
    if (!isAfter(this.date, startOfDay(new Date()))) {
      return next(new Error('Event date must be in the future'));
    }
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
























// const mongoose = require('mongoose');
// const { isAfter, startOfDay } = require('date-fns');

// const eventSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, 'Title is required'],
//     trim: true,
//   },
//   description: {
//     type: String,
//     required: [true, 'Description is required'],
//     trim: true,
//   },
//   date: {
//     type: Date,
//     required: [true, 'Date is required'],
//     validate: {
//       validator: (value) => isAfter(value, startOfDay(new Date())),
//       message: 'Event date must be in the future',
//     },
//     index: true,
//   },
//   time: {
//     type: String,
//     required: [true, 'Time is required'],
//   },
//   location: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       required: [true, 'Location type is required'],
//       default: 'Point',
//     },
//     coordinates: {
//       type: [Number],
//       required: [true, 'Coordinates are required'],
//       validate: {
//         validator: ([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
//         message: 'Coordinates must be valid longitude and latitude values',
//       },
//       index: '2dsphere',
//     },
//     street: {
//       type: String,
//       required: false,
//     },
//     city: {
//       type: String,
//       required: [true, 'City is required'],
//       index: true,
//     },
//     state: {
//       type: String,
//       required: [true, 'State is required'],
//       index: true,
//     },
//     country: {
//       type: String,
//       required: [true, 'Country is required'],
//       index: true,
//     },
//     zipCode: {
//       type: String,
//       index: true,
//     },
//   },
//   category: {
//     type: String,
//     required: [true, 'Category is required'],
//     enum: ['Music', 'Sports', 'Art', 'Food', 'Tech', 'Recreation', 'Other'],
//     index: true,
//   },
//   demographics: {
//     ageGroup: String,
//     interests: [String],
//   },
//   tags: [String],
//   creator: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: [true, 'Creator is required'],
//   },
//   attendees: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   }],
//   images: [{
//     type: String,
//     required: true,
//   }],
//   isFeatured: {
//     type: Boolean,
//     default: false,
//   },
// });

// // Validate event date before saving
// eventSchema.pre('save', function (next) {
//   if (this.isNew || this.isModified('date')) {
//     if (!isAfter(this.date, startOfDay(new Date()))) {
//       return next(new Error('Event date must be in the future'));
//     }
//   }
//   next();
// });

// const Event = mongoose.model('Event', eventSchema);

// module.exports = Event;




















// //best code for june8 at 3pm
// const mongoose = require('mongoose');
// const { isAfter, startOfDay } = require('date-fns');

// const eventSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, 'Title is required'],
//     trim: true,
//   },
//   description: {
//     type: String,
//     required: [true, 'Description is required'],
//     trim: true,
//   },
//   date: {
//     type: Date,
//     required: [true, 'Date is required'],
//     validate: {
//       validator: (value) => isAfter(value, startOfDay(new Date())),
//       message: 'Event date must be in the future',
//     },
//     index: true,
//   },
//   time: {
//     type: String,
//     required: [true, 'Time is required'],
//   },
//   location: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       required: [true, 'Location type is required'],
//       default: 'Point',
//     },
//     coordinates: {
//       type: [Number],
//       required: [true, 'Coordinates are required'],
//       validate: {
//         validator: ([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
//         message: 'Coordinates must be valid longitude and latitude values',
//       },
//       index: '2dsphere',
//     },
//     street: {
//       type: String,
//       required: false,  // Made street optional
//     },
//     city: {
//       type: String,
//       required: [true, 'City is required'],
//       index: true,
//     },
//     state: {
//       type: String,
//       required: [true, 'State is required'],
//       index: true,
//     },
//     country: {
//       type: String,
//       required: [true, 'Country is required'],
//       index: true,
//     },
//     zipCode: {
//       type: String,
//       index: true,
//     },
//   },
//   category: {
//     type: String,
//     required: [true, 'Category is required'],
//     enum: ['Music', 'Sports', 'Art', 'Food', 'Tech', 'Recreation', 'Other'],
//     index: true,
//   },
//   demographics: {
//     ageGroup: String,
//     interests: [String],
//   },
//   tags: [String],
//   creator: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: [true, 'Creator is required'],
//   },
//   attendees: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   }],
//   images: [{
//     type: String,
//     required: true,
//   }],
//   isFeatured: {
//     type: Boolean,
//     default: false,
//   },
// });

// // Validate event date before saving
// eventSchema.pre('save', function (next) {
//   if (this.isNew || this.isModified('date')) {
//     if (!isAfter(this.date, startOfDay(new Date()))) {
//       return next(new Error('Event date must be in the future'));
//     }
//   }
//   next();
// });

// const Event = mongoose.model('Event', eventSchema);

// module.exports = Event;











// const mongoose = require('mongoose');
// const { isAfter, startOfDay } = require('date-fns');

// const eventSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, 'Title is required'],
//     trim: true,
//   },
//   description: {
//     type: String,
//     required: [true, 'Description is required'],
//     trim: true,
//   },
//   date: {
//     type: Date,
//     required: [true, 'Date is required'],
//     validate: {
//       validator: (value) => isAfter(value, startOfDay(new Date())),
//       message: 'Event date must be in the future',
//     },
//     index: true,
//   },
//   time: {
//     type: String,
//     required: [true, 'Time is required'],
//   },
//   location: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       required: [true, 'Location type is required'],
//       default: 'Point'
//     },
//     coordinates: {
//       type: [Number],
//       required: [true, 'Coordinates are required'],
//       validate: {
//         validator: ([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
//         message: 'Coordinates must be valid longitude and latitude values',
//       },
//       index: '2dsphere'  // Ensure this line is present
//     },
//     street: {
//       type: String,
//       required: [true, 'Street address is required'],
//     },
//     city: {
//       type: String,
//       required: [true, 'City is required'],
//       index: true
//     },
//     state: {
//       type: String,
//       required: [true, 'State is required'],
//       index: true
//     },
//     country: {
//       type: String,
//       required: [true, 'Country is required'],
//       index: true
//     },
//     zipCode: {
//       type: String,
//       index: true
//     }
//   },
//   category: {
//     type: String,
//     required: [true, 'Category is required'],
//     enum: ['Music', 'Sports', 'Art', 'Food', 'Tech', 'Recreation', 'Other, ..'],
//     index: true,
//   },
//   demographics: {
//     ageGroup: String,
//     interests: [String],
//   },
//   tags: [String],
//   creator: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: [true, 'Creator is required'],
//   },
//   attendees: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   }],
//   images: [{
//     type: String,
//     required: true,
//   }],
//   isFeatured: {
//     type: Boolean,
//     default: false,
//   },
// });

// // Validate event date before saving
// eventSchema.pre('save', function (next) {
//   if (this.isNew || this.isModified('date')) {
//     if (!isAfter(this.date, startOfDay(new Date()))) {
//       return next(new Error('Event date must be in the future'));
//     }
//   }
//   next();
// });

// const Event = mongoose.model('Event', eventSchema);

// module.exports = Event;
