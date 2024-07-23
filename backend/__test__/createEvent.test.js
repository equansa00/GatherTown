const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Event = require('../models/Event');
const logger = require('../config/logger');

describe('Event API', () => {
  let userId;
  let token;
  let savedEvent; // Store the created event

  beforeAll(async () => {
    // Clear Existing Data
    await User.deleteMany({});
    await Event.deleteMany({});

    // Register User
    const userData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };
    const res = await request(app)
      .post('/api/users/register')
      .send(userData);
    expect(res.status).toBe(201);
    userId = res.body.user._id;
    token = res.body.token; // Store authentication token for event creation

    // Force verify user
    await User.updateOne({ email: userData.email }, { $set: { verified: true } });

    // Log user creation and token generation
    logger.info('User created:', { userId });
    logger.info('Token generated:', { token });
  });

  afterAll(async () => {
    // Clean up
    await User.deleteMany({});
    await Event.deleteMany({});
  });

  // POST Test for creating a new event
  it('POST /api/events - should create a new event', async () => {
    const eventData = {
      title: 'Test Event',
      description: 'This is a test event',
      startDateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour in the future
      endDateTime: new Date(Date.now() + 7200000).toISOString(),   // 2 hours in the future
      date: new Date(Date.now() + 3600000).toISOString(),         // 1 hour in the future
      timezone: 'America/New_York',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.73061],
        addressLine1: '123 Main St',
        street: 'Main St',
        city: 'New York',
        state: 'NY',
        country: 'United States of America'  // Corrected country name
      },
      category: 'Tech',
      subCategory: 'Conference',
      tags: ['tech', 'conference'],
      organizerInfo: 'Organizer Information',
      capacity: 100,
      time: '8:00 PM', // add time
      createdBy: userId // Reference the created user's ID
    };

    const eventResponse = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(eventData);

    // Log event creation response
    logger.info('Event creation response:', { eventResponse: eventResponse.body });

    expect(eventResponse.statusCode).toBe(201); // 201 Created
    expect(eventResponse.body.event).toHaveProperty('title', 'Test Event');

    // Save the created event for use in later tests
    savedEvent = eventResponse.body.event; 
  });

  // GET Test to retrieve events
  it('GET /api/events - should retrieve all events', async () => {
    const eventResponse = await request(app)
      .get('/api/events');

    // Log event retrieval response
    logger.info('Event retrieval response:', { statusCode: eventResponse.statusCode, body: eventResponse.body });

    expect(eventResponse.statusCode).toBe(200);
    expect(eventResponse.body.events.length).toBeGreaterThanOrEqual(1); // At least one event should exist
  });

  // PUT Test for updating events
  it('PUT /api/events/:id - should update an existing event', async () => {
    expect(savedEvent).toBeDefined(); // Ensure we have an event to update
    logger.info('Event found for update:', { savedEvent }); // Log event id to be updated

    // Corrected update data (ensure valid date formats)
    const updatedEvent = {
      title: 'Updated Test Event',
      description: 'This is an updated test event',
      startDateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour in the future
      endDateTime: new Date(Date.now() + 7200000).toISOString(),   // 2 hours in the future
      date: new Date(Date.now() + 3600000).toISOString(),         // 1 hour in the future
      timezone: 'America/New_York',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.73061],
        addressLine1: '123 Main St',
        street: 'Main St',
        city: 'New York',
        state: 'NY',
        country: 'United States of America'  // Corrected country name
      },
      category: 'Tech',
      subCategory: 'Conference',
      tags: ['tech', 'conference'],
      organizerInfo: 'Organizer Information',
      capacity: 100,
      time: '8:00 PM'
    };

    const updateResponse = await request(app)
      .put(`/api/events/${savedEvent._id}`) // Use the _id of the saved event
      .set('Authorization', `Bearer ${token}`)
      .send(updatedEvent);

    // Log event update response
    logger.info('Event update response:', { statusCode: updateResponse.statusCode, body: updateResponse.body });

    expect(updateResponse.statusCode).toBe(200); // 200 OK
    expect(updateResponse.body.event.title).toBe('Updated Test Event');
    expect(updateResponse.body.event.description).toBe('This is an updated test event');
  });

  // DELETE Test for deleting events
  it('DELETE /api/events/:id - should delete an existing event', async () => {
    expect(savedEvent).toBeDefined(); // Ensure we have an event to delete
    logger.info('Event found for deletion:', { savedEvent }); // Log event id to be deleted

    const deleteResponse = await request(app)
      .delete(`/api/events/${savedEvent._id}`) // Use the _id of the saved event
      .set('Authorization', `Bearer ${token}`);

    // Log event deletion response
    logger.info('Event deletion response:', { statusCode: deleteResponse.statusCode, body: deleteResponse.body });

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body).toHaveProperty('message', 'Event deleted successfully');
  });
});