const mongoose = require('mongoose');
const Event = require('./models/event'); // Adjust the path as necessary

// Connect to MongoDB
mongoose.connect('mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const validateEvents = async () => {
  try {
    const events = await Event.find({});

    events.forEach(event => {
      // Validate necessary information
      if (!event.title || !event.description || !event.startDateTime || !event.endDateTime || !event.timezone) {
        console.log(`Event ID: ${event._id} is missing necessary information.`);
      }
      
      // Validate coordinates
      const [longitude, latitude] = event.location.coordinates;
      if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        console.log(`Event ID: ${event._id} has invalid coordinates.`);
      }
      
      // Validate country code
      if (!countryList.getCodeList()[event.location.country]) {
        console.log(`Event ID: ${event._id} has invalid country code.`);
      }

      // Additional validation as necessary...
    });

    console.log('Event validation complete.');
  } catch (error) {
    console.error('Error validating events:', error);
  } finally {
    mongoose.connection.close();
  }
};

validateEvents();

