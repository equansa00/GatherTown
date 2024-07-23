///home/equansa00/Downloads/GatherTown/backend/models/Event.js
const mongoose = require('mongoose');
const { isAfter } = require('date-fns');
const countryList = require('country-list');

// Get the list of country names
const countryNames = countryList.getNames();

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: ([longitude, latitude]) => {
        return (
          longitude >= -180 && longitude <= 180 &&
          latitude >= -90 && latitude <= 90
        );
      },
      message: 'Invalid coordinates',
    },
    index: '2dsphere', // Ensure 2dsphere index is created
  },
  addressLine1: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  addressLine2: String,
  city: {
    type: String,
    required: true,
    index: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    enum: countryNames, // Use country names
    index: true
  },
  postalCode: String
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  startDateTime: {
    type: Date,
    required: [true, 'Start date and time are required'],
    validate: {
      validator: (value) => isAfter(value, new Date()), // Compare to the current time
      message: 'Event start date and time must be in the future'
    },
    index: true
  },
  endDateTime: {
    type: Date,
    required: [true, 'End date and time are required']
  },
  date: {
    type: Date, // Changed to Date type for consistency
    required: [true, 'Date is required']
  },
  timezone: {
    type: String,
    required: [true, 'Timezone is required']
  },
  location: {
    type: locationSchema,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Music', 'Sports', 'Art', 'Food & Drink', 'Tech', 'Recreation', 'Other', 'Concert', 'Business Conference', 'Charity Run', 'Church Event', 'School Play'],
    index: true
  },
  subCategory: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    required: true
  },
  organizerInfo: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  rsvpCount: {
    type: Number,
    default: 0
  },
  rsvpStatus: {
    type: String,
    enum: ['Confirmed', 'Pending', 'Cancelled'],
    default: 'Pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  images: [String],
  status: {
    type: String,
    enum: ['Scheduled', 'Cancelled', 'Completed'],
    default: 'Scheduled'
  }
}, {
  timestamps: true
});

// Ensure index creation
eventSchema.index({ 'location.coordinates': '2dsphere' });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;


























// const mongoose = require('mongoose');
// const { isAfter } = require('date-fns');
// const countryList = require('country-list');

// // Get the list of country names
// const countryNames = countryList.getNames();
// console.log("Country Names:", countryNames); // Log the country names for debugging

// const locationSchema = new mongoose.Schema({
//   type: {
//     type: String,
//     enum: ['Point'],
//     required: true,
//     default: 'Point'
//   },
//   coordinates: {
//     type: [Number],
//     required: true,
//     validate: {
//       validator: ([longitude, latitude]) => {
//         return (
//           longitude >= -180 && longitude <= 180 &&
//           latitude >= -90 && latitude <= 90
//         );
//       },
//       message: 'Invalid coordinates',
//     },
//     index: '2dsphere',
//   },
//   addressLine1: {
//     type: String,
//     required: true
//   },
//   street: {
//     type: String,
//     required: true
//   },
//   addressLine2: String,
//   city: {
//     type: String,
//     required: true,
//     index: true
//   },
//   state: {
//     type: String,
//     required: true
//   },
//   country: {
//     type: String,
//     required: true,
//     enum: countryNames, // Use country names
//     index: true
//   },
//   postalCode: String
// });

// const eventSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, 'Title is required'],
//     trim: true,
//     index: true
//   },
//   description: {
//     type: String,
//     required: [true, 'Description is required'],
//     trim: true
//   },
//   startDateTime: {
//     type: Date,
//     required: [true, 'Start date and time are required'],
//     validate: {
//       validator: (value) => isAfter(value, new Date()), // Compare to the current time
//       message: 'Event start date and time must be in the future'
//     },
//     index: true
//   },
//   endDateTime: {
//     type: Date,
//     required: [true, 'End date and time are required']
//   },
//   date: {
//     type: Date, // Changed to Date type for consistency
//     required: [true, 'Date is required']
//   },
//   timezone: {
//     type: String,
//     required: [true, 'Timezone is required']
//   },
//   location: {
//     type: locationSchema,
//     required: true
//   },
//   category: {
//     type: String,
//     required: true,
//     enum: ['Music', 'Sports', 'Art', 'Food & Drink', 'Tech', 'Recreation', 'Other', 'Concert', 'Business Conference', 'Charity Run', 'Church Event', 'School Play'],
//     index: true
//   },
//   subCategory: {
//     type: String,
//     required: true
//   },
//   tags: {
//     type: [String],
//     required: true
//   },
//   organizerInfo: {
//     type: String,
//     required: true
//   },
//   capacity: {
//     type: Number,
//     required: true
//   },
//   rsvpCount: {
//     type: Number,
//     default: 0
//   },
//   rsvpStatus: {
//     type: String,
//     enum: ['Confirmed', 'Pending', 'Cancelled'],
//     default: 'Pending'
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: 'User'
//   },
//   images: [String],
//   status: {
//     type: String,
//     enum: ['Scheduled', 'Cancelled', 'Completed'],
//     default: 'Scheduled'
//   }
// }, {
//   timestamps: true
// });

// const Event = mongoose.model('Event', eventSchema);

// // Add console logs for debugging
// console.log("Event Schema defined with the following structure:");
// console.log(Event.schema.obj);

// module.exports = Event;












// const mongoose = require('mongoose');
// const { isAfter } = require('date-fns');
// const countryList = require('country-list');

// // Get the list of country names
// const countryNames = countryList.getNames();
// console.log("Country Names:", countryNames); // Log the country names for debugging

// const locationSchema = new mongoose.Schema({
//   type: {
//     type: String,
//     enum: ['Point'],
//     required: true,
//     default: 'Point'
//   },
//   coordinates: {
//     type: [Number],
//     required: true,
//     validate: {
//       validator: ([longitude, latitude]) => {
//         return (
//           longitude >= -180 && longitude <= 180 &&
//           latitude >= -90 && latitude <= 90
//         );
//       },
//       message: 'Invalid coordinates',
//     },
//     index: '2dsphere',
//   },
//   addressLine1: {
//     type: String,
//     required: true
//   },
//   street: {
//     type: String,
//     required: true
//   },
//   addressLine2: String,
//   city: {
//     type: String,
//     required: true,
//     index: true
//   },
//   state: {
//     type: String,
//     required: true
//   },
//   country: {
//     type: String,
//     required: true,
//     enum: countryNames, // Use country names
//     index: true
//   },
//   postalCode: String
// });

// const eventSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, 'Title is required'],
//     trim: true,
//     index: true
//   },
//   description: {
//     type: String,
//     required: [true, 'Description is required'],
//     trim: true
//   },
//   startDateTime: {
//     type: Date,
//     required: [true, 'Start date and time are required'],
//     validate: {
//       validator: (value) => isAfter(value, new Date()), // Compare to the current time
//       message: 'Event start date and time must be in the future'
//     },
//     index: true
//   },
//   endDateTime: {
//     type: Date,
//     required: [true, 'End date and time are required']
//   },
//   date: {
//     type: Date, // Changed to Date type for consistency
//     required: [true, 'Date is required']
//   },
//   timezone: {
//     type: String,
//     required: [true, 'Timezone is required']
//   },
//   location: {
//     type: locationSchema,
//     required: true
//   },
//   category: {
//     type: String,
//     required: true,
//     enum: ['Music', 'Sports', 'Art', 'Food & Drink', 'Tech', 'Recreation', 'Other', 'Concert', 'Business Conference', 'Charity Run', 'Church Event', 'School Play'],
//     index: true
//   },
//   subCategory: {
//     type: String,
//     required: true
//   },
//   tags: {
//     type: [String],
//     required: true
//   },
//   organizerInfo: {
//     type: String,
//     required: true
//   },
//   capacity: {
//     type: Number,
//     required: true
//   },
//   rsvpCount: {
//     type: Number,
//     default: 0
//   },
//   rsvpStatus: {
//     type: String,
//     enum: ['Confirmed', 'Pending', 'Cancelled'],
//     default: 'Pending'
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     ref: 'User'
//   },
//   images: [String],
//   status: {
//     type: String,
//     enum: ['Scheduled', 'Cancelled', 'Completed'],
//     default: 'Scheduled'
//   }
// }, {
//   timestamps: true
// });

// const Event = mongoose.model('Event', eventSchema);

// // Add console logs for debugging
// console.log("Event Schema defined with the following structure:");
// console.log(Event.schema.obj);

// module.exports = Event;


















// const mongoose = require('mongoose');
// const { isAfter, startOfDay } = require('date-fns');
// const countryList = require('country-list');

// const eventSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, 'Title is required'],
//     trim: true,
//     index: true,
//   },
//   description: {
//     type: String,
//     required: [true, 'Description is required'],
//     trim: true,
//   },
//   startDateTime: {
//     type: Date,
//     required: [true, 'Start date and time are required'],
//     validate: {
//       validator: (value) => isAfter(value, startOfDay(new Date())),
//       message: 'Event start date and time must be in the future',
//     },
//     index: true,
//   },
//   endDateTime: {
//     type: Date,
//     required: [true, 'End date and time are required'],
//   },
//   date: {
//     type: String,
//     required: [true, 'Date is required'],
//     validate: {
//       validator: (value) => !isNaN(Date.parse(value)),
//       message: 'Date must be a valid ISO 8601 date',
//     },
//   },
//   timezone: {
//     type: String,
//     required: [true, 'Timezone is required'],
//   },
//   location: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       required: true,
//       default: 'Point',
//     },
//     coordinates: {
//       type: [Number],
//       required: true,
//       validate: {
//         validator: ([longitude, latitude]) => {
//           return (
//             longitude >= -180 && longitude <= 180 &&
//             latitude >= -90 && latitude <= 90
//           );
//         },
//         message: 'Invalid coordinates'
//       },
//       index: '2dsphere',
//     },
//     addressLine1: { type: String, required: true },
//     street: { type: String, required: true },
//     addressLine2: String,
//     city: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     state: { type: String, required: true },
//     country: {
//       type: String,
//       required: true,
//       enum: countryList.getNames(), // Use countryList.getNames() for valid country names
//       index: true,
//     },
//     postalCode: String,
//   },
//   category: {
//     type: String,
//     required: true,
//     enum: ['Music', 'Sports', 'Art', 'Food & Drink', 'Tech', 'Recreation', 'Other', 'Concert', 'Business Conference', 'Charity Run', 'Church Event', 'School Play'],
//     index: true,
//   },
//   subCategory: { type: String, required: true },
//   tags: { type: [String], required: true },
//   organizerInfo: { type: String, required: true },
//   capacity: { type: Number, required: true },
//   rsvpCount: { type: Number, default: 0 },
//   rsvpStatus: {
//     type: String,
//     enum: ['Open', 'Closed', 'Waitlist'],
//     default: 'Open',
//   },
//   maxRSVPs: Number,
//   rsvpDeadline: Date,
//   waitlist: [mongoose.Schema.Types.ObjectId], // IDs of users on the waitlist
//   attendance: [{
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     rsvpDate: Date,
//     status: {
//       type: String,
//       enum: ['Attending', 'Not Attending', 'Maybe'],
//       default: 'Attending',
//     },
//   }],
//   images: { type: [String], required: true },
//   status: { type: String, required: true },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   createdDate: { type: Date, default: Date.now },
//   updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   updatedDate: { type: Date },
//   userFeedback: [String],
// });

// eventSchema.pre('save', function (next) {
//   if (this.isNew || this.isModified('startDateTime')) {
//     if (!isAfter(this.startDateTime, startOfDay(new Date()))) {
//       return next(new Error('Event start date and time must be in the future'));
//     }
//     this.date = this.startDateTime.toISOString().split('T')[0];
//   }
//   next();
// });

// const Event = mongoose.model('Event', eventSchema);
// module.exports = Event;








// const mongoose = require('mongoose');
// const { isAfter, startOfDay } = require('date-fns');
// const countryList = require('country-list');

// const eventSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, 'Title is required'],
//     trim: true,
//     index: true,
//   },
//   description: {
//     type: String,
//     required: [true, 'Description is required'],
//     trim: true,
//   },
//   startDateTime: {
//     type: Date,
//     required: [true, 'Start date and time are required'],
//     validate: {
//       validator: (value) => isAfter(value, startOfDay(new Date())),
//       message: 'Event start date and time must be in the future',
//     },
//     index: true,
//   },
//   endDateTime: {
//     type: Date,
//     required: [true, 'End date and time are required'],
//   },
//   date: {
//     type: String,
//     required: [true, 'Date is required'],
//     validate: {
//       validator: (value) => !isNaN(Date.parse(value)),
//       message: 'Date must be a valid ISO 8601 date',
//     },
//   },
//   timezone: {
//     type: String,
//     required: [true, 'Timezone is required'],
//   },
//   location: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       required: true,
//       default: 'Point',
//     },
//     coordinates: {
//       type: [Number],
//       required: true,
//       validate: {
//         validator: ([longitude, latitude]) => {
//           return (
//             longitude >= -180 && longitude <= 180 &&
//             latitude >= -90 && latitude <= 90
//           );
//         },
//         message: 'Invalid coordinates'
//       },
//       index: '2dsphere',
//     },
//     addressLine1: { type: String, required: true },
//     street: { type: String, required: true },
//     addressLine2: String,
//     city: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     state: { type: String, required: true },
//     country: {
//       type: String,
//       required: true,
//       enum: Object.keys(countryList.getCodeList()), // Use country codes
//       index: true,
//     },
//     postalCode: String,
//   },
//   category: {
//     type: String,
//     required: true,
//     enum: ['Music', 'Sports', 'Art', 'Food & Drink', 'Tech', 'Recreation', 'Other', 'Concert', 'Business Conference', 'Charity Run', 'Church Event', 'School Play'],
//     index: true,
//   },
//   subCategory: { type: String, required: true },
//   tags: { type: [String], required: true },
//   organizerInfo: { type: String, required: true },
//   capacity: { type: Number, required: true },
//   rsvpCount: { type: Number, default: 0 },
//   rsvpStatus: {
//     type: String,
//     enum: ['Open', 'Closed', 'Waitlist'],
//     default: 'Open',
//   },
//   maxRSVPs: Number,
//   rsvpDeadline: Date,
//   waitlist: [mongoose.Schema.Types.ObjectId], // IDs of users on the waitlist
//   attendance: [{
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     rsvpDate: Date,
//     status: {
//       type: String,
//       enum: ['Attending', 'Not Attending', 'Maybe'],
//       default: 'Attending',
//     },
//   }],
//   images: { type: [String], required: true },
//   status: { type: String, required: true },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   createdDate: { type: Date, default: Date.now },
//   updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   updatedDate: { type: Date },
//   userFeedback: [String],
// });

// eventSchema.pre('save', function (next) {
//   if (this.isNew || this.isModified('startDateTime')) {
//     if (!isAfter(this.startDateTime, startOfDay(new Date()))) {
//       return next(new Error('Event start date and time must be in the future'));
//     }
//     this.date = this.startDateTime.toISOString().split('T')[0];
//   }
//   next();
// });

// const Event = mongoose.model('Event', eventSchema);
// module.exports = Event;



// //backend/models/Event.js
// const mongoose = require('mongoose');
// const { isAfter, startOfDay } = require('date-fns');
// const countryList = require('country-list');

// const eventSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, 'Title is required'],
//     trim: true,
//     index: true,
//   },
//   description: {
//     type: String,
//     required: [true, 'Description is required'],
//     trim: true,
//   },
//   startDateTime: {
//     type: Date,
//     required: [true, 'Start date and time are required'],
//     validate: {
//       validator: (value) => isAfter(value, startOfDay(new Date())),
//       message: 'Event start date and time must be in the future',
//     },
//     index: true,
//   },
//   endDateTime: {
//     type: Date,
//     required: [true, 'End date and time are required'],
//   },
//   date: {
//     type: String,
//     required: [true, 'Date is required'],
//     validate: {
//       validator: (value) => !isNaN(Date.parse(value)),
//       message: 'Date must be a valid ISO 8601 date',
//     },
//   },
//   timezone: {
//     type: String,
//     required: [true, 'Timezone is required'],
//   },
//   location: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       required: true,
//       default: 'Point',
//     },
//     coordinates: {
//       type: [Number],
//       required: true,
//       validate: {
//         validator: ([longitude, latitude]) => {
//           return (
//             longitude >= -180 && longitude <= 180 &&
//             latitude >= -90 && latitude <= 90
//           );
//         },
//         message: 'Invalid coordinates'
//       },
//       index: '2dsphere',
//     },
//     addressLine1: { type: String, required: true },
//     street: { type: String, required: true },
//     addressLine2: String,
//     city: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     state: { type: String, required: true },
//     country: {
//       type: String,
//       required: true,
//       enum: Object.keys(countryList.getCodeList()),
//       index: true,
//     },
//     postalCode: String,
//   },
//   category: {
//     type: String,
//     required: true,
//     enum: ['Music', 'Sports', 'Art', 'Food & Drink', 'Tech', 'Recreation', 'Other', 'Concert', 'Business Conference', 'Charity Run', 'Church Event', 'School Play'],
//     index: true,
//   },
//   subCategory: { type: String, required: true },
//   tags: { type: [String], required: true },
//   organizerInfo: { type: String, required: true },
//   capacity: { type: Number, required: true },
//   rsvpCount: { type: Number, default: 0 },
//   ticketInfo: { type: String, required: true },
//   images: { type: [String], required: true },
//   status: { type: String, required: true },
//   time: { type: String, required: true },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
// });

// eventSchema.pre('save', function (next) {
//   if (this.isNew || this.isModified('startDateTime')) {
//     if (!isAfter(this.startDateTime, startOfDay(new Date()))) {
//       return next(new Error('Event start date and time must be in the future'));
//     }
//     this.date = this.startDateTime.toISOString().split('T')[0];
//   }
//   next();
// });

// const Event = mongoose.model('Event', eventSchema);
// module.exports = Event;