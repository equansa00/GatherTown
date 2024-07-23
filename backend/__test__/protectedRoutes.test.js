// backend/__test__/protectedRoutes.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); // Adjust the path to where your Express app is exported
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('Protected route access', () => {
    let server, validToken;

    beforeAll(async () => {
        server = app.listen(4000); // Start the server on a new port for testing
    });

    afterAll(async () => {
        await mongoose.disconnect();
        server.close();
    });

    beforeEach(async () => {
        await User.deleteMany({}); // Clear users collection before each test
        const user = await User.create({
            email: 'test@example.com',
            password: 'password',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User'
        });
        validToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('User created and token generated:', { email: user.email, token: validToken });
    });

    test('Access protected route with valid token', async () => {
        const response = await request(server)
            .get('/api/users/protected_endpoint')
            .set('Authorization', `Bearer ${validToken}`);

        console.log('Response for valid token:', response.body, response.status);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
    });

    test('Access protected route with invalid token', async () => {
        const response = await request(server)
            .get('/api/users/protected_endpoint')
            .set('Authorization', 'Bearer wrongtoken123');

        console.log('Response for invalid token:', response.body, response.status);
        expect(response.status).toBe(401);
    });
});
