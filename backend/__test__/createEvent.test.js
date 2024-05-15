const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const Event = require('../models/Event');
const User = require('../models/User');

describe('Event API', () => {
    let token, event;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI);

        // Clear existing users to ensure the environment is ready for tests
        await User.deleteMany({});
        await Event.deleteMany({});

        const user = await User.create({
            username: 'testUser',
            email: 'test@example.com',
            password: 'password123', // Assume this is hashed according to your User model requirements
            verified: true
        });

        // Generate a JWT token for the created user
        token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Create an initial event to be used in tests
        event = await Event.create({
            title: 'Community Picnic',
            description: 'A fun picnic with community members',
            location: { type: 'Point', coordinates: [-73.968285, 40.785091] },
            category: 'Recreation',
            date: '2024-06-12',
            time: '12:00',
            creator: user._id
        });
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('POST /api/events', () => {
        describe('GET /api/events', () => {
            it('GET /api/events - should retrieve all events', async () => {
                const response = await request(app)
                    .get('/api/events')
                    .set('Authorization', `Bearer ${token}`);
                expect(response.status).toBe(200);
                expect(response.body.length).toBeGreaterThan(0); // Ensure events are retrieved
            });
        });

        it('should create a new event', async () => {
            const eventData = {
                title: "Community Picnic",
                description: "A fun picnic with community members",
                location: {
                    type: "Point",
                    coordinates: [-73.968285, 40.785091]  // Example coordinates
                },
                category: "Recreation",
                date: "2024-06-12",
                time: "12:00"
            };

            // Log attempt to create a new event
            console.log('Attempting to create a new event:', eventData);

            // Execute the POST request to create a new event
            const response = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${token}`) // Use the token for authentication
                .send(eventData);

            // Log the response from the event creation attempt
            console.log('Event creation response:', response.body);

            // Assertions to validate the response
            expect(response.status).toBe(201);  // Expecting a 201 Created response
            expect(response.body).toHaveProperty('event');  // Check if response has 'event' property
            expect(response.body.event).toHaveProperty('_id');  // Check if the event object has '_id'
            expect(response.body.event.title).toEqual(eventData.title);
            expect(response.body.event.description).toEqual(eventData.description);
            expect(response.body.event.location).toEqual(eventData.location);
            expect(new Date(response.body.event.date)).toEqual(new Date(eventData.date));  // Ensure dates match
            expect(response.body.event.time).toEqual(eventData.time);  // Ensure times match
        });
    });

    describe('PUT /api/events/:id', () => {
        it('should update an existing event', async () => {
            const updatedData = {
                title: 'Updated Event Title',
                description: 'Updated event description.',
                location: {
                    type: "Point",
                    coordinates: [-73.968285, 40.785091]  // Example coordinates
                },
                category: "Recreation",
                date: "2024-06-12",
                time: "18:00"
            };

            const response = await request(app)
                .put(`/api/events/${event._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updatedData);

            // Log the response body for debugging
            console.log('Event update response:', response.body);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.title).toEqual(updatedData.title);
            expect(response.body.description).toEqual(updatedData.description);
            expect(new Date(response.body.date)).toEqual(new Date(updatedData.date));  // Ensure dates match
            expect(response.body.time).toEqual(updatedData.time);  // Ensure times match
        });
    });

    describe('DELETE /api/events/:id', () => {
        it('should delete an existing event', async () => {
            const response = await request(app)
                .delete(`/api/events/${event._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('msg', 'Event removed');

            const deletedEvent = await Event.findById(event._id);
            expect(deletedEvent).toBeNull(); // Check if the event has been successfully removed
        });
    });
});








