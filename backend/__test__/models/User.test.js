//home/equansa00/Downloads/GatherTown/backend/__test__/models/User.test.js
const mongoose = require('mongoose');
const User = require('../../models/User');
const Event = require('../../models/Event');
const logger = require('../../config/logger');

describe('User Model Indexes and Queries', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await User.deleteMany({});
    await Event.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({}); // Clear the User collection
    await Event.deleteMany({}); // Clear the Event collection
    await mongoose.connection.close();
  });

  it('should ensure indexes are created', async () => {
    const indexes = await User.collection.getIndexes();
    logger.info('Indexes:', indexes);
    expect(indexes).toHaveProperty('username_1');
    expect(indexes).toHaveProperty('email_1');
  });

  it('should create and query users based on interests', async () => {
    const user = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      interests: ['Music', 'Sports'],
    });
    await user.save();

    const usersWithInterest = await User.find({ interests: 'Music' });
    logger.info('Queried users with interest in Music:', usersWithInterest);
    expect(usersWithInterest.length).toBeGreaterThan(0);
    expect(usersWithInterest[0].interests).toContain('Music');
  });

  it('should query users based on events attended', async () => {
    const event = new Event({
      title: 'Test Event',
      description: 'This is a test event',
      startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      endDateTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // 1 hour after start
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timezone: 'GMT',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.73061], // New York coordinates
        addressLine1: '123 Main St',
        street: 'Main St',
        addressLine2: '',
        city: 'New York',
        state: 'NY',
        country: 'United States of America',
        postalCode: '12345',
      },
      category: 'Music',
      subCategory: 'Rock',
      tags: ['concert', 'rock'],
      organizerInfo: 'Test Organizer',
      capacity: 100,
      rsvpCount: 0,
      rsvpStatus: 'Pending',
      status: 'Scheduled',
      createdBy: new mongoose.Types.ObjectId(),
    });
    await event.save();

    const user = new User({
      username: 'testuser2',
      email: 'testuser2@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      eventsAttended: [event._id],
    });
    await user.save();

    const usersAttendingEvent = await User.find({ eventsAttended: event._id });
    logger.info('Queried users who attended the event:', usersAttendingEvent);
    expect(usersAttendingEvent.length).toBeGreaterThan(0);
    expect(usersAttendingEvent[0].eventsAttended).toContainEqual(event._id);
  });
});

