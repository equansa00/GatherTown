const mongoose = require('mongoose');
const Event = require('../models/Event'); // Adjust the path to your Event model

async function updateOldEvents() {
  await mongoose.connect('mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const events = await Event.find();

  for (let event of events) {
    if (!event.location.street) {
      event.location.street = 'Unknown Street';
    }
    if (!event.location.city) {
      event.location.city = 'Unknown City';
    }
    if (!event.location.state) {
      event.location.state = 'Unknown State';
    }
    if (!event.location.country) {
      event.location.country = 'Unknown Country';
    }
    if (!event.location.zipCode) {
      event.location.zipCode = '00000';
    }

    await event.save();
  }

  console.log('All events updated successfully.');
  mongoose.connection.close();
}

updateOldEvents().catch(console.error);
