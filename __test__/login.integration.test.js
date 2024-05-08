const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Import bcrypt to hash passwords

describe('Login Integration Tests', () => {
    const userData = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123'
    };

    beforeEach(async () => {
        await User.deleteMany({}); // Clear the user collection

        // Create and save the user as verified
        const user = new User({
            ...userData,
            password: await bcrypt.hash(userData.password, 10), // Hash the password
            verified: true // Set verified to true
        });
        await user.save();

        console.log('User registered and verified:', {email: user.email, verified: user.verified});
    });

    it('should login a user and return a JWT', async () => {
        const response = await request(app)
            .post('/api/users/login')
            .send({
                email: userData.email,
                password: userData.password
            })
            .expect(200); // Expecting HTTP 200 OK

        console.log('Login response:', response.body);
        expect(response.body).toHaveProperty('token');
    });

    it('should not login an unverified user', async () => {
        // Set user to unverified
        await User.updateOne({ email: userData.email }, { verified: false });

        const response = await request(app)
            .post('/api/users/login')
            .send({
                email: userData.email,
                password: userData.password
            })
            .expect(401); // Expecting HTTP 401 Unauthorized

        console.log('Login attempt for unverified user:', response.body);
        expect(response.body).not.toHaveProperty('token');
    });
});
