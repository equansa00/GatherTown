const mongoose = require('mongoose');
const Event = require('./models/Event'); // Adjust the path as needed

mongoose.connect('mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateEvents = async () => {
  try {
    const events = await Event.find({});
    for (const event of events) {
      let updated = false;

      // Handle invalid creator values
      if (event.creator && typeof event.creator !== 'object') {
        event.creator = null; // Remove invalid creator
        updated = true;
      }
      // Set default values for missing location fields
      if (!event.location.country) {
        event.location.country = 'Unknown';
        updated = true;
      }
      if (!event.location.state) {
        event.location.state = 'Unknown';
        updated = true;
      }
      if (!event.location.city) {
        event.location.city = 'Unknown';
        updated = true;
      }
      if (!event.location.zipCode) {
        event.location.zipCode = 'Unknown';
        updated = true;
      }
      if (updated) {
        await event.save();
      }
    }
    console.log('Events updated successfully.');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error updating events:', error);
    mongoose.connection.close();
  }
};

updateEvents();