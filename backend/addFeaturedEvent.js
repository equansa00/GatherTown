// addFeaturedEvent.js
const mongoose = require('mongoose');
const Event = require('./models/Event'); // Adjust the path as needed

const addFeaturedEvent = async () => {
  // Replace 'your-mongo-uri' with your actual MongoDB connection string
  const mongoUri = 'mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test?retryWrites=true&w=majority';

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const event = new Event({
    title: 'Featured Event',
    description: 'This is a featured event.',
    date: new Date(new Date().setDate(new Date().getDate() + 1)), // Set to tomorrow
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.730610],
      address: 'Some address'
    },
    category: 'Music',
    time: '18:00',
    creator: mongoose.Types.ObjectId(), // Use an existing user ID
    isFeatured: true,
    images: ['image1.jpg', 'image2.jpg']
  });

  await event.save();
  console.log('Featured event added');
  await mongoose.disconnect();
};

addFeaturedEvent().catch(console.error);
