jest.mock('../utils/sendEmail', () => ({
    sendEmail: jest.fn(() => Promise.resolve({ messageId: 'testMessageId' }))
}));

const request = require('supertest');
const app = require('../server'); 
const User = require('../models/User');
const { sendEmail } = require('../utils/sendEmail'); 
const crypto = require('crypto');

describe('POST /api/auth/forgot-password', () => {
    let token;

    beforeAll(async () => {
        console.log('Creating test user...');
        await User.create({
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            email: 'testuser@example.com',
            password: 'password123',
            verified: true
        });
        console.log('Test user created.');
    });

    afterAll(async () => {
        console.log('Deleting all users...');
        await User.deleteMany({});
        console.log('All users deleted.');
    });

    it('should send a password reset email if user exists', async () => {
        console.log('Testing password reset email...');
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'testuser@example.com' });

        console.log('Response received:', res);
        expect(res.statusCode).toEqual(200);
        expect(res.text).toContain('Password reset email sent.');
        expect(sendEmail).toHaveBeenCalled();

        const emailText = sendEmail.mock.calls[0][0].text;
        token = emailText.match(/reset-password\/([a-f0-9]+)/)[1]; 
        console.log('Token extracted:', token);
    });

    it('should return 404 if user does not exist', async () => {
        console.log('Testing non-existent user...');
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'nonexistent@example.com' });

        console.log('Response received:', res);
        expect(res.statusCode).toEqual(404);
        expect(res.text).toContain('No user with this email.');
    });

    it('should reset the password with a valid token', async () => {
        console.log('Testing password reset...');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        console.log('Hashed token:', hashedToken);

        const user = await User.findOne({ resetPasswordToken: hashedToken });
        console.log('User found:', user);
        expect(user).not.toBeNull();

        const res = await request(app)
            .post(`/api/auth/reset-password/${token}`)
            .send({ password: 'newpassword123', confirmPassword: 'newpassword123' });

        console.log('Reset password response:', res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toContain('Password reset successful, you can now log in with the new password.');

        const updatedUser = await User.findById(user._id);
        console.log('Updated user:', updatedUser);
        expect(updatedUser.resetPasswordToken).toBeUndefined();
        expect(updatedUser.resetPasswordExpires).toBeUndefined();

        const isPasswordMatch = await updatedUser.comparePassword('newpassword123');
        console.log('Password match:', isPasswordMatch);
        expect(isPasswordMatch).toBe(true);
    });
});
