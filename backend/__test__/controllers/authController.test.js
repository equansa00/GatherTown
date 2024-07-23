//backend/__test__/controllers/authController.test.js
const {
    requestPasswordReset,
    forgotPassword,
    resetPassword
} = require('../../controllers/authController');
const User = require('../../models/User');
const httpMocks = require('node-mocks-http');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail } = require('../../utils/sendEmail');

// Mocking the required modules
jest.mock('../../models/User');
jest.mock('bcryptjs');
jest.mock('crypto');
jest.mock('../../utils/sendEmail');

describe('Auth Controller', () => {
    // Test suite for requestPasswordReset function
    describe('requestPasswordReset', () => {
        it('should send password reset link to the user email', async () => {
            const req = httpMocks.createRequest({ body: { email: 'test@example.com' } });
            const res = httpMocks.createResponse();

            User.findOne.mockResolvedValue({
                _id: '1',
                email: 'test@example.com',
                save: jest.fn().mockResolvedValue(true)
            });

            const token = 'resettoken123';
            crypto.randomBytes.mockReturnValue({ toString: () => token });
            await requestPasswordReset(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getData()).toBe('Password reset link sent to your email.');
            expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
                to: 'test@example.com',
                subject: 'Password Reset'
            }));
        });

        it('should return error if email is not found', async () => {
            const req = httpMocks.createRequest({ body: { email: 'unknown@example.com' } });
            const res = httpMocks.createResponse();

            User.findOne.mockResolvedValue(null);

            await requestPasswordReset(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getData()).toBe('No user found with that email.');
        });
    });

    // Test suite for forgotPassword function
    describe('forgotPassword', () => {
        it('should send password reset email', async () => {
            const req = httpMocks.createRequest({ body: { email: 'test@example.com' } });
            const res = httpMocks.createResponse();

            User.findOne.mockResolvedValue({
                _id: '1',
                email: 'test@example.com',
                save: jest.fn().mockResolvedValue(true)
            });

            const token = 'resettoken123';
            crypto.randomBytes.mockReturnValue({ toString: () => token });
            await forgotPassword(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getData()).toBe('Password reset email sent.');
            expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
                to: 'test@example.com',
                subject: 'Password Reset'
            }));
        });

        it('should return error if email is not found', async () => {
            const req = httpMocks.createRequest({ body: { email: 'unknown@example.com' } });
            const res = httpMocks.createResponse();

            User.findOne.mockResolvedValue(null);

            await forgotPassword(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getData()).toBe('No user found with that email.');
        });
    });

    // Test suite for resetPassword function
    describe('resetPassword', () => {
        it('should reset user password', async () => {
            const req = httpMocks.createRequest({ body: { token: 'validToken', password: 'newPassword123' } });
            const res = httpMocks.createResponse();

            User.findOne.mockResolvedValue({
                _id: '1',
                resetPasswordToken: 'validToken',
                resetPasswordExpires: Date.now() + 3600000,
                save: jest.fn().mockResolvedValue(true)
            });

            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashedPassword');

            await resetPassword(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getData()).toBe('Your password has been reset successfully.');
        });

        it('should return error for invalid or expired token', async () => {
            const req = httpMocks.createRequest({ body: { token: 'invalidToken', password: 'newPassword123' } });
            const res = httpMocks.createResponse();

            User.findOne.mockResolvedValue(null);

            await resetPassword(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getData()).toBe('Reset token is invalid or has expired.');
        });
    });
});
