const mongoose = require('mongoose');
const Event = require('../../models/Event');

describe('Event Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create and save an event successfully', async () => {
    const eventData = {
      title: 'Test Event',
      description: 'This is a test event',
      startDateTime: new Date(Date.now() + 60 * 60 * 1000), // Ensure it's in the future
      endDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      date: new Date(), // Use Date type for consistency
      timezone: 'America/New_York',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.73061],
        addressLine1: '123 Test St',
        street: 'Test Street',
        city: 'New York',
        state: 'NY',
        country: 'United States of America' // Ensure this matches one of the country names
      },
      category: 'Concert',
      subCategory: 'Music',
      tags: ['Concert', 'Music', 'New York'],
      organizerInfo: 'Test Organizer',
      capacity: 100,
      rsvpCount: 10,
      images: ['https://example.com/image.jpg'],
      status: 'Scheduled',
      createdBy: new mongoose.Types.ObjectId()
    };

    const event = new Event(eventData);
    const savedEvent = await event.save();

    expect(savedEvent._id).toBeDefined();
    expect(savedEvent.title).toBe(eventData.title);
    // Add other expectations as needed
  });

  it('should fail to create an event without required fields', async () => {
    const eventData = {
      // Omitting required fields to test validation
    };

    let err;
    try {
      const event = new Event(eventData);
      await event.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeDefined();
    expect(err.errors.title).toBeDefined();
    // Add other expectations as needed
  });

  it('should not allow creating an event with startDateTime in the past', async () => {
    const eventData = {
      title: 'Past Event',
      description: 'This is a past event',
      startDateTime: new Date(Date.now() - 60 * 60 * 1000), // Ensure it's in the past
      endDateTime: new Date(),
      date: new Date(), // Use Date type for consistency
      timezone: 'America/New_York',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.73061],
        addressLine1: '123 Test St',
        street: 'Test Street',
        city: 'New York',
        state: 'NY',
        country: 'United States of America' // Ensure this matches one of the country names
      },
      category: 'Concert',
      subCategory: 'Music',
      tags: ['Concert', 'Music', 'New York'],
      organizerInfo: 'Test Organizer',
      capacity: 100,
      rsvpCount: 10,
      images: ['https://example.com/image.jpg'],
      status: 'Scheduled',
      createdBy: new mongoose.Types.ObjectId()
    };

    let error;
    try {
      const event = new Event(eventData);
      await event.save();
    } catch (err) {
      error = err;
      console.error('Validation Error Details:', err); // Print the entire error object
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.startDateTime).toBeDefined();
    expect(error.errors.startDateTime.message).toBe('Event start date and time must be in the future');
  });
});
