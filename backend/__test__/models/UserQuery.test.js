///home/equansa00/Downloads/GatherTown/backend/__test__/models/UserQuery.test.js
const mongoose = require('mongoose');
const User = require('../../models/User');
const Event = require('../../models/Event');
const logger = require('../../config/logger'); // Assuming you have a logger configured

describe('User Model Indexes and Queries', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testDB', { useNewUrlParser: true, useUnifiedTopology: true });
    await User.deleteMany({});
    await Event.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('should ensure indexes are created', async () => {
    await User.createIndexes(); // Ensure indexes are created
    const indexes = await User.collection.getIndexes();
    logger.info('Indexes:', indexes); // Log indexes
    expect(indexes).toHaveProperty('username_1');
    expect(indexes).toHaveProperty('email_1');
  });

  it('should create and query users based on interests', async () => {
    logger.info('Creating a test user with interests...');
    const newUser = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      interests: ['Music', 'Sports']
    });
    await newUser.save();
    logger.info('Test user created successfully.');

    const musicLovers = await User.find({ interests: 'Music' });
    logger.info('Queried users with interest in Music:', musicLovers);

    expect(musicLovers.length).toBeGreaterThan(0);
    expect(musicLovers[0].interests).toContain('Music');
  });

  it('should query users based on events attended', async () => {
    logger.info('Creating a test event...');
    const newEvent = new Event({
      title: 'Test Event',
      description: 'This is a test event',
      startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      endDateTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // 1 hour after start
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timezone: 'GMT',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.73061], // New York coordinates
        addressLine1: '123 Test St',
        street: 'Test Street',
        addressLine2: '',
        city: 'New York',
        state: 'NY',
        country: 'United States of America', // Corrected country name
        postalCode: '12345',
      },
      category: 'Music',
      subCategory: 'Rock',
      tags: ['concert', 'rock'],
      organizerInfo: 'Test Organizer',
      capacity: 100,
      rsvpCount: 0,
      rsvpStatus: 'Pending', // Corrected value
      status: 'Scheduled', // Corrected value
      createdBy: new mongoose.Types.ObjectId(),
    });
    await newEvent.save();
    logger.info('Test event created successfully.');

    const newUser = new User({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      eventsAttended: [newEvent._id]
    });
    await newUser.save();
    logger.info('Test user with events attended created successfully.');

    const eventAttendees = await User.find({ eventsAttended: newEvent._id }).populate('eventsAttended');
    logger.info('Queried users who attended the event:', eventAttendees);

    expect(eventAttendees.length).toBeGreaterThan(0);
    expect(eventAttendees[0].eventsAttended[0].title).toBe('Test Event');
  });
});
