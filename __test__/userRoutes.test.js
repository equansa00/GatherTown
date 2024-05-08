//home/equansa00/Desktop/GatherTown/__test__/userRoutes.test.js
const request = require('supertest');
const app = require('../server');
const User = require('../models/User'); // Import your User model

// Define the test suite
describe('User Registration and Login Tests', () => {
    console.log("JWT_SECRET from environment:", process.env.JWT_SECRET);

    const userData = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'password123'
    };

    test('It should register a new user and then log in the user', async () => {
        const regResponse = await request(app)
            .post('/api/users/register')
            .send(userData)
            .expect(201);

        console.log('Registration response:', regResponse.body);
        expect(regResponse.body).toHaveProperty('token');

        // Manually verify the user for the purpose of testing
        await User.updateOne({ email: userData.email }, { $set: { verified: true } });

        await new Promise(resolve => setTimeout(resolve, 1000));

        const loginResponse = await request(app)
            .post('/api/users/login')
            .send({
                email: userData.email,
                password: userData.password
            })
            .expect(200);

        console.log('Login response:', loginResponse.body);
        expect(loginResponse.body).toHaveProperty('token');
    });
});
