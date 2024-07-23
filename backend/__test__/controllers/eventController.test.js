///home/equansa00/Downloads/GatherTown/backend/__test__/controllers/eventController.test.js
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../server');
const User = require('../../models/User');
const Event = require('../../models/Event');
const jwt = require('jsonwebtoken');


describe('Event Controller', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await User.deleteMany({});
    await Event.deleteMany({});

    const user = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    });

    await user.save();
    userId = user._id;
    token = jwt.sign({ _id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Event.deleteMany({});
    await mongoose.connection.close();
  });

  it('should create a new event', async () => {
    const eventData = {
      title: 'Test Event',
      description: 'This is a test event',
      startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      endDateTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // 1 hour after start
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timezone: 'America/New_York',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.73061], // New York coordinates
        addressLine1: '123 Test St',
        street: 'Test Street',
        city: 'New York',
        state: 'NY',
        country: 'United States of America' // Use the correct country name
      },
      category: 'Concert',
      subCategory: 'Music',
      tags: ['Concert', 'Music', 'New York'],
      organizerInfo: 'Test Organizer',
      capacity: 100,
      rsvpCount: 10,
      images: ['https://example.com/image.jpg'],
      status: 'Scheduled',
      createdBy: userId,
      time: '8:00 PM' // Adding the time field
    };

    console.log('Event Data:', eventData); // Log event data for debugging

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(eventData);

    console.log('Response Status:', res.status); // Log response status for debugging
    console.log('Response Body:', res.body); // Log response body for debugging

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Event created successfully');
    expect(res.body.event).toHaveProperty('_id');
    expect(res.body.event.title).toBe(eventData.title);
  });
  
  it('should get events', async () => {
    const event = new Event({
      title: 'Test Event for GET',
      description: 'This is a test event for GET',
      startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endDateTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timezone: 'America/New_York',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.73061],
        addressLine1: '123 Test St',
        street: 'Test Street',
        city: 'New York',
        state: 'NY',
        country: 'United States of America', // Corrected country name
      },
      category: 'Concert',
      subCategory: 'Music',
      tags: ['Concert', 'Music', 'New York'],
      organizerInfo: 'Test Organizer',
      capacity: 100,
      rsvpCount: 10,
      images: ['https://example.com/image.jpg'],
      status: 'Scheduled',
      createdBy: userId,
    });
    await event.save();

    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.events).toBeDefined();
    expect(res.body.events.length).toBeGreaterThan(0);
    expect(res.body.totalEvents).toBeGreaterThan(0);
  });

  it('should update an event', async () => {
    const event = new Event({
      title: 'Initial Event',
      description: 'Initial description',
      startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      endDateTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // 1 hour after start
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timezone: 'America/New_York',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.73061],
        addressLine1: '123 Initial St',
        street: 'Initial Street',
        city: 'New York',
        state: 'NY',
        country: 'United States of America'
      },
      category: 'Concert',
      subCategory: 'Music',
      tags: ['Initial', 'Music', 'New York'],
      organizerInfo: 'Initial Organizer',
      capacity: 100,
      rsvpCount: 10,
      images: ['https://example.com/image.jpg'],
      status: 'Scheduled',
      createdBy: userId,
      time: '8:00 PM'
    });
  
    await event.save();
  
    const updateData = {
      title: 'Updated Event Title',
      description: 'Updated description',
      startDateTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days from now
      endDateTime: new Date(Date.now() + 49 * 60 * 60 * 1000), // 1 hour after start
      date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
      timezone: 'America/New_York',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.73061],
        addressLine1: '123 Updated St',
        street: 'Updated Street',
        city: 'New York',
        state: 'NY',
        country: 'United States of America'
      },
      category: 'Concert',
      subCategory: 'Music',
      tags: ['Updated', 'Music', 'New York'],
      organizerInfo: 'Updated Organizer',
      capacity: 150,
      rsvpCount: 20,
      images: ['https://example.com/updated_image.jpg'],
      status: 'Scheduled',
      createdBy: userId,
      time: '9:00 PM'
    };
  
    const res = await request(app)
      .put(`/api/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);
  
    expect(res.status).toBe(200);
    expect(res.body.event.title).toBe(updateData.title);
  });
  
  it('should delete an event', async () => {
    const event = new Event({
      title: 'Test Event for Delete',
      description: 'This is a test event for Delete',
      startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endDateTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      timezone: 'America/New_York',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.73061],
        addressLine1: '123 Test St',
        street: 'Test Street',
        city: 'New York',
        state: 'NY',
        country: 'United States of America', // Corrected country name
      },
      category: 'Concert',
      subCategory: 'Music',
      tags: ['Concert', 'Music', 'New York'],
      organizerInfo: 'Test Organizer',
      capacity: 100,
      rsvpCount: 10,
      images: ['https://example.com/image.jpg'],
      status: 'Scheduled',
      createdBy: userId,
    });
    await event.save();

    const res = await request(app)
      .delete(`/api/events/${event._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Event deleted successfully');
  });

  it('should return a 400 error for invalid input', async () => {
    const eventData = {
      title: '', // Missing required field
      // ... other fields ...
    };

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(eventData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors'); // Check if errors object exists in response
  });
});


























// const mongoose = require('mongoose');
// const request = require('supertest');
// const app = require('../../server');
// const User = require('../../models/User');
// const Event = require('../../models/Event');
// const jwt = require('jsonwebtoken');

// describe('Event Controller', () => {
//   let token;
//   let userId;

//   beforeAll(async () => {
//     await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
//     await User.deleteMany({});
//     await Event.deleteMany({});
    
//     const user = new User({
//       username: 'testuser',
//       email: 'testuser@example.com',
//       password: 'password123',
//       firstName: 'Test',
//       lastName: 'User',
//     });

//     await user.save();
//     userId = user._id;

//     token = jwt.sign({ _id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
//   });

//   afterAll(async () => {
//     await User.deleteMany({});
//     await Event.deleteMany({});
//     await mongoose.connection.close();
//   });

//   it('should create a new event', async () => {
//     const eventData = {
//       title: 'Test Event',
//       description: 'This is a test event',
//       startDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
//       endDateTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // 1 hour after start
//       date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//       timezone: 'America/New_York',
//       location: {
//         type: 'Point',
//         coordinates: [-73.935242, 40.73061], // New York coordinates
//         addressLine1: '123 Test St',
//         street: 'Test Street',
//         city: 'New York',
//         state: 'NY',
//         country: 'US', // use country code
//       },
//       category: 'Concert',
//       subCategory: 'Music',
//       tags: ['Concert', 'Music', 'New York'],
//       organizerInfo: 'Test Organizer',
//       capacity: 100,
//       rsvpCount: 10,
//       images: ['https://example.com/image.jpg'],
//       status: 'Scheduled',
//       createdBy: userId,
//     };

//     const res = await request(app)
//       .post('/api/events')
//       .set('Authorization', `Bearer ${token}`)
//       .send(eventData);

//     expect(res.status).toBe(201);
//     expect(res.body.event).toHaveProperty('_id');
//     expect(res.body.event.title).toBe(eventData.title);
//   });

//   it('should not create event with invalid date', async () => {
//     const invalidEventData = {
//       title: 'Invalid Date Event',
//       description: 'This is a test event',
//       startDateTime: 'invalid-date',
//       endDateTime: new Date(Date.now() + 1 * 60 * 60 * 1000),
//       date: 'invalid-date',
//       timezone: 'America/New_York',
//       location: {
//         type: 'Point',
//         coordinates: [-73.935242, 40.73061],
//         addressLine1: '123 Test St',
//         street: 'Test Street',
//         city: 'New York',
//         state: 'NY',
//         country: 'US',
//       },
//       category: 'Concert',
//       subCategory: 'Music',
//       tags: ['Concert', 'Music', 'New York'],
//       organizerInfo: 'Test Organizer',
//       capacity: 100,
//       rsvpCount: 10,
//       images: ['https://example.com/image.jpg'],
//       status: 'Scheduled',
//       createdBy: userId,
//     };

//     const res = await request(app)
//       .post('/api/events')
//       .set('Authorization', `Bearer ${token}`)
//       .send(invalidEventData);

//     expect(res.status).toBe(400);
//     expect(res.body.errors).toBeDefined();
//     expect(res.body.errors.length).toBeGreaterThan(0);
//     expect(res.body.errors[0].msg).toBe('Date must be a valid ISO 8601 date');
//   });

//   it('should get events', async () => {
//     const res = await request(app)
//       .get('/api/events')
//       .set('Authorization', `Bearer ${token}`);

//     expect(res.status).toBe(200);
//     expect(res.body.events).toBeDefined();
//     expect(res.body.totalEvents).toBe(1);
//   });

//   it('should update an event', async () => {
//     const event = await Event.findOne({ title: 'Test Event' });

//     const updateData = {
//       title: 'Updated Event Title',
//     };

//     const res = await request(app)
//       .put(`/api/events/${event ? event._id : ''}`)
//       .set('Authorization', `Bearer ${token}`)
//       .send(updateData);

//     expect(res.status).toBe(200);
//     expect(res.body.event.title).toBe(updateData.title);
//   });

//   it('should delete an event', async () => {
//     const event = await Event.findOne({ title: 'Updated Event Title' });

//     const res = await request(app)
//       .delete(`/api/events/${event ? event._id : ''}`)
//       .set('Authorization', `Bearer ${token}`);

//     expect(res.status).toBe(200);
//     expect(res.body.message).toBe('Event deleted successfully');
//   });
// });
