const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

describe('Login Integration Tests', () => {
    let token;
    let userData;

    beforeAll(async () => {
        userData = {
            username: `testuser_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
        };

        logger.info('Starting user registration test with data:', userData);

        // Clear the Users collection
        await User.deleteMany({});
        logger.info('Users collection cleared');

        // Register a new user
        const regResponse = await request(app)
            .post('/api/users/register')
            .send(userData)
            .expect(201);

        logger.info('Registration response:', regResponse.body);
        expect(regResponse.body).toHaveProperty('token');

        // Manually verify the user for the purpose of testing
        await User.updateOne({ email: userData.email }, { $set: { verified: true } });
        logger.info(`User ${userData.email} manually verified`);

        // Wait to ensure the user verification is completed
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Log in the user
        const loginResponse = await request(app)
            .post('/api/users/login')
            .send({
                email: userData.email,
                password: userData.password
            })
            .expect(200);

        logger.info('Login response:', loginResponse.body);
        expect(loginResponse.body).toHaveProperty('token');
        token = loginResponse.body.token;
    });

    afterAll(async () => {
        // Clean up the user from the database after tests
        await User.deleteOne({ email: userData.email });
    });

    it('should login a user and return a JWT', async () => {
        logger.info('Attempting to log in user:', userData.email);
        const response = await request(app)
            .post('/api/users/login')
            .send({
                email: userData.email,
                password: userData.password
            })
            .expect(200);

        logger.info('Login response:', response.body);
        expect(response.body).toHaveProperty('token');
    });

    it('should not login an unverified user', async () => {
        // Clear the Users collection
        await User.deleteMany({});
        logger.info('Users collection cleared');

        // Create and save an unverified user
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new User({
            ...userData,
            password: hashedPassword,
            verified: false
        });
        await user.save();

        logger.info('User registered but unverified:', { email: user.email, verified: user.verified });

        // Attempt to log in the unverified user
        const response = await request(app)
            .post('/api/users/login')
            .send({
                email: userData.email,
                password: userData.password
            })
            .expect(401);

        logger.info('Login attempt for unverified user:', response.body);
        expect(response.body).not.toHaveProperty('token');
    });
});
