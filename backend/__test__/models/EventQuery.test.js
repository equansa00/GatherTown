//home/equansa00/Downloads/GatherTown/backend/__test__/models/EventQuery.test.js
const mongoose = require('mongoose');
const Event = require('../../models/Event');
const logger = require('../../config/logger');

describe('Event Model Indexes and Queries', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb+srv://equansa00:fz1WqpWC4my4bUbd@capstonecluster.3hkgzzk.mongodb.net/Local_Event_Finder_test', { useNewUrlParser: true, useUnifiedTopology: true });
    await Event.deleteMany({});
    await Event.createIndexes(); // Ensure indexes are created
  });

  afterAll(async () => {
    await Event.deleteMany({}); // Clear the events collection instead of dropping the database
    await mongoose.connection.close();
  });

  it('should ensure indexes are created', async () => {
    // 1. Explicitly create indexes before checking
    await Event.createIndexes();
  
    // 2. Get and log all indexes for debugging
    const indexes = await Event.collection.getIndexes();
    logger.info('All Indexes:', indexes);
    console.log('All Indexes:', indexes); // Add console log for debugging
  
    // 3. Extract index keys for simplified checking
    try {
      const indexKeys = Object.keys(indexes).map(index => Object.keys(indexes[index].key)).flat();
      logger.info('Index Keys:', indexKeys);
      console.log('Index Keys:', indexKeys); // Add console log for debugging
    } catch (error) {
      logger.error('Error extracting index keys:', error);
      console.log('Error extracting index keys:', error); // Add console log for debugging
    }
  
    // 4. Check for all expected indexes 
    const expectedIndexes = [
      '_id_', // Default _id index
      'title_1',
      'startDateTime_1',
      'location_2dsphere',
      'location.city_1',
      'location.country_1',
      'location.coordinates_2dsphere',
    ];
    expectedIndexes.forEach(indexName => {
      expect(Object.keys(indexes)).toContain(indexName);
    });
  });

  it('should create and query events based on location index', async () => {
    logger.info('Creating a test event with location index...');
    const newEvent = new Event({
      title: 'Test Event',
      description: 'This is a test event',
      startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      endDateTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // 1 hour after start
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      timezone: 'GMT',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.73061], // New York coordinates
        addressLine1: '123 Test St',
        street: 'Test Street',
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
    await newEvent.save();
    logger.info('Test event created successfully.');

    const nearbyEvents = await Event.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [-73.935242, 40.73061],
          },
          $maxDistance: 10000, // 10 km
        },
      },
    });
    logger.info('Queried nearby events:', nearbyEvents);

    expect(nearbyEvents.length).toBeGreaterThan(0);
    expect(nearbyEvents[0].title).toBe('Test Event');
  });

  it('should query events based on category', async () => {
    const musicEvents = await Event.find({ category: 'Music' });
    logger.info('Queried music events:', musicEvents);
    expect(musicEvents.length).toBeGreaterThan(0);
    expect(musicEvents[0].category).toBe('Music');
  });

  it('should query events based on date', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set to midnight
  
    const eventsOnDate = await Event.find({
      date: {
        $gte: tomorrow, 
        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) // Next day midnight
      }
    }); 
    logger.info('Queried events on date:', eventsOnDate);
    expect(eventsOnDate.length).toBeGreaterThan(0);
  });
  

  it('should query events based on city', async () => {
    const newYorkEvents = await Event.find({ 'location.city': 'New York' });
    logger.info('Queried events in New York:', newYorkEvents);
    expect(newYorkEvents.length).toBeGreaterThan(0);
    expect(newYorkEvents[0].location.city).toBe('New York');
  });

  it('should query events based on country', async () => {
    const usEvents = await Event.find({ 'location.country': 'United States of America' });
    logger.info('Queried events in United States of America:', usEvents);
    expect(usEvents.length).toBeGreaterThan(0);
    expect(usEvents[0].location.country).toBe('United States of America');
  });
});
