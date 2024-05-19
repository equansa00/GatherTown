
// backend/__test__/forgotPassword.test.js
jest.mock('../utils/sendEmail', () => ({
    sendEmail: jest.fn(() => Promise.resolve({ messageId: 'testMessageId' }))
}));

const request = require('supertest');
const app = require('../server'); // Make sure this is correctly pointing to your server setup that uses the authController
const User = require('../models/User');
const { sendEmail } = require('../utils/sendEmail'); // This import is critical; ensure it matches the actual usage path in the authController

describe('POST /api/auth/forgot-password', () => {
    beforeAll(async () => {
        await User.create({
            username: 'nana1',
            firstName: 'Edward',
            lastName: 'Quansah',
            email: 'nana1@gmail.com',
            password: 'password123',
            verified: true
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
    });

    it('should send a password reset email if user exists', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'nana1@gmail.com' });

        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Password reset email sent.');
        expect(sendEmail).toHaveBeenCalled(); // Ensure this is being called as expected
    });

    it('should return 404 if user does not exist', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'nonexistent@gmail.com' });

        expect(res.statusCode).toEqual(404);
        expect(res.text).toContain('User with this email does not exist.');
    });
});
