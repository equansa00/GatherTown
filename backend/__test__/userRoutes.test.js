// backend/__test__/userRoutes.test.js
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const logger = require('../config/logger');

describe('User Routes Tests', () => {
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

        const regResponse = await request(app)
            .post('/api/users/register')
            .send(userData)
            .expect(201);

        logger.info('Registration response:', regResponse.body);
        expect(regResponse.body).toHaveProperty('token');

        // Manually verify the user for the purpose of testing
        const verifyResult = await User.updateOne({ email: userData.email }, { $set: { verified: true } });
        logger.info(`User ${userData.email} manually verified`, verifyResult);

        // Wait for a moment to ensure the user verification is completed
        await new Promise(resolve => setTimeout(resolve, 1000));

        const loginResponse = await request(app)
            .post('/api/users/login')
            .send({
                email: userData.email,
                password: userData.password
            })
            .expect(200);

        logger.info('Login response:', loginResponse.body);
        expect(loginResponse.body).toHaveProperty('token');
        token = loginResponse.body.token; // Save token in the outer scope
    });

    afterAll(async () => {
        // Clean up the user from the database after tests
        await User.deleteOne({ email: userData.email });
    });

    it('should register a new user and then log in the user', async () => {
        // No changes are needed here since registration and login are done in beforeAll()
    });

    it('should get the user profile', async () => {
        logger.info('Test: Get user profile');
      
        const profileResponse = await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${token}`) 
          .expect(200);
      
        logger.info('Profile response:', profileResponse.body);
        logger.info('Profile response keys:', Object.keys(profileResponse.body)); // Log keys to understand structure
        expect(profileResponse.body.user).toHaveProperty('email', userData.email); // Ensure email exists and matches
    });

    it('should update the user profile', async () => {
        const updatedData = {
            firstName: 'Updated',
            lastName: 'Name'
        };
    
        console.log('Sending update request with data:', updatedData);
    
        const updateResponse = await request(app)
            .put('/api/users/profile')
            .set('Authorization', `Bearer ${token}`)
            .send(updatedData);
    
        console.log('Update Response Status:', updateResponse.status);
        console.log('Full update response body:', updateResponse.body); // Log the entire response body
    
        expect(updateResponse.body).toHaveProperty('firstName', updatedData.firstName); // Fixed assertion
        expect(updateResponse.body).toHaveProperty('lastName', updatedData.lastName);   // Fixed assertion
    });
    

    it('should change the user password', async () => {
        logger.info('Test: Change user password');

        const changePasswordData = { currentPassword: 'password123', newPassword: 'newpassword123' };
        await request(app)
            .put('/api/users/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send(changePasswordData)
            .expect(200);

        // Log in again with the new password to get an updated token
        const newLoginResponse = await request(app)
            .post('/api/users/login')
            .send({
                email: userData.email,
                password: changePasswordData.newPassword
            })
            .expect(200);

        logger.info('New login response:', newLoginResponse.body);
        token = newLoginResponse.body.token; // Update the token
    });
});
