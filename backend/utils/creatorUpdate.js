const mongoose = require('mongoose');
const Event = require('../models/Event'); // Adjust the path as needed

const MONGO_URI = 'mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority'; // Replace with your actual MongoDB URI
const DEFAULT_CREATOR = '664ce668c3524efd85208b28'; // Replace with a valid ObjectId from your User collection

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(async () => {
    console.log('MongoDB connected successfully');
  
    try {
      const result = await Event.updateMany(
        {
          $or: [
            { creator: { $exists: false } },
            { creator: null },
            { creator: '' },
            { creator: { $type: 2 } } // $type: 2 matches string type
          ]
        },
        { $set: { creator: DEFAULT_CREATOR } }, // Set default creator
      );
  
      console.log(`Updated ${result.nModified} events`);
    } catch (err) {
      console.error('Error updating events:', err);
    } finally {
      mongoose.disconnect();
    }
  }).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
