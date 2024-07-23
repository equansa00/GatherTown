// backend/__test__/controllers/userController.test.js
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    verifyEmail,
    forgotPassword,
    resetPassword
} = require('../../controllers/userController');
const User = require('../../models/User');
const Event = require('../../models/Event');
const httpMocks = require('node-mocks-http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../../utils/sendEmail');

// Mocking the required modules
jest.mock('../../models/User');
jest.mock('../../models/Event');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../utils/sendEmail');

describe('User Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('registerUser', () => {
        it('should create a new user', async () => {
            const req = { body: { username: 'testuser', email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User' } };
            const res = httpMocks.createResponse();

            User.findOne.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedPassword');
            jwt.sign.mockReturnValue('fakeToken');
            User.prototype.save.mockResolvedValue({
                _id: "1",
                username: req.body.username,
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                verified: true
            });

            console.log('Running test for creating a new user');
            await registerUser(req, res);

            expect(res.statusCode).toBe(201);
            const responseData = res._getJSONData();
            expect(responseData).toHaveProperty('user');
            expect(responseData).toHaveProperty('token', 'fakeToken');
            console.log('Test for creating a new user passed');
        });

        it('should not create a user if email already exists', async () => {
            const req = { body: { username: 'testuser', email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User' } };
            const res = httpMocks.createResponse();

            User.findOne.mockResolvedValue(true);

            console.log('Running test for email already exists');
            await registerUser(req, res);

            expect(res.statusCode).toBe(409);
            expect(res._getJSONData()).toEqual({ msg: 'Email already exists' });
            console.log('Test for email already exists passed');
        });
    });

    describe('loginUser', () => {
        it('should authenticate a verified user', async () => {
            const req = httpMocks.createRequest({
                method: 'POST',
                url: '/login',
                body: { email: 'test@example.com', password: 'password123' }
            });
            const res = httpMocks.createResponse({
                eventEmitter: require('events').EventEmitter
            });

            User.findOne.mockResolvedValue({
                _id: '1',
                email: 'test@example.com',
                password: '$2a$10$examplehash',
                verified: true
            });
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockImplementation((payload, secret, options) => 'fakeToken');

            console.log('Running test for authenticated verified user');
            await loginUser(req, res);

            res.on('end', () => {
                expect(res.statusCode).toBe(200);
                expect(res._getJSONData()).toHaveProperty('token', 'fakeToken');
                console.log('Test for authenticated verified user passed');
            });
        });

        it('should prevent login for unverified users', async () => {
            const req = httpMocks.createRequest({
                method: 'POST',
                url: '/login',
                body: { email: 'test@example.com', password: 'password123' }
            });
            const res = httpMocks.createResponse();

            User.findOne.mockResolvedValue({
                _id: '1',
                email: 'test@example.com',
                password: '$2a$10$examplehash',
                verified: false
            });
            bcrypt.compare.mockResolvedValue(true);

            console.log('Running test for unverified user login prevention');
            await loginUser(req, res);

            expect(res.statusCode).toBe(401);
            expect(res._getJSONData()).toEqual({ message: 'Authentication failed, user not found or not verified' });
            console.log('Test for unverified user login prevention passed');
        });
    });

    describe('getUserProfile', () => {
        it('should retrieve a user profile', async () => {
            const req = { user: { id: '1' } };
            const res = httpMocks.createResponse();

            const mockUser = {
                _id: '1',
                username: 'testUser',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                toObject: jest.fn().mockReturnValue({
                    _id: '1',
                    username: 'testUser',
                    email: 'test@example.com',
                    firstName: 'Test',
                    lastName: 'User'
                }),
                select: jest.fn().mockReturnThis()
            };

            User.findById.mockReturnValue(mockUser);
            Event.find.mockResolvedValue([{ title: 'Event 1' }, { title: 'Event 2' }]);

            console.log('Running test for retrieving user profile');
            await getUserProfile(req, res);

            const responseData = res._getJSONData();
            expect(responseData).toHaveProperty('user');
            expect(responseData).toHaveProperty('createdEvents');
            expect(responseData).toHaveProperty('rsvpedEvents');
            console.log('Test for retrieving user profile passed');
        });
    });

    describe('updateUserProfile', () => {
        it('should update a user profile', async () => {
            const req = { user: { id: '1' }, body: { name: 'Updated Name', email: 'updated@example.com' } };
            const res = httpMocks.createResponse();

            User.findByIdAndUpdate.mockResolvedValue({
                _id: '1',
                name: 'Updated Name',
                email: 'updated@example.com',
                toObject: jest.fn().mockReturnValue({
                    _id: '1',
                    name: 'Updated Name',
                    email: 'updated@example.com'
                })
            });

            console.log('Running test for updating user profile');
            await updateUserProfile(req, res);

            const responseData = res._getJSONData();
            expect(responseData).toHaveProperty('_id', '1');
            expect(responseData).toHaveProperty('email', 'updated@example.com');
            console.log('Test for updating user profile passed');
        });
    });

    describe('changePassword', () => {
        it('should change a user password', async () => {
            const req = { user: { id: '1' }, body: { currentPassword: 'currentPassword123', newPassword: 'newPassword123' } };
            const res = httpMocks.createResponse();

            User.findById.mockResolvedValue({
                _id: '1',
                password: '$2a$10$examplehash'
            });
            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('$2a$10$newhashedpassword');

            console.log('Running test for changing user password');
            await changePassword(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({ message: 'Password updated successfully' });
            console.log('Test for changing user password passed');
        });

        it('should return error if current password is incorrect', async () => {
            const req = { user: { id: '1' }, body: { currentPassword: 'wrongPassword', newPassword: 'newPassword123' } };
            const res = httpMocks.createResponse();

            User.findById.mockResolvedValue({
                _id: '1',
                password: '$2a$10$examplehash'
            });
            bcrypt.compare.mockResolvedValue(false);

            console.log('Running test for incorrect current password');
            await changePassword(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ error: 'Incorrect current password' });
            console.log('Test for incorrect current password passed');
        });
    });

    describe('verifyEmail', () => {
        it('should verify user email', async () => {
            const req = { params: { token: 'validToken' } };
            const res = httpMocks.createResponse();

            jwt.verify.mockResolvedValue({ id: '1' });
            User.findById.mockResolvedValue({
                _id: '1',
                verified: false,
                save: jest.fn().mockResolvedValue(true)
            });

            console.log('Running test for verifying user email');
            await verifyEmail(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getData()).toBe('Email successfully verified.');
            console.log('Test for verifying user email passed');
        });

        it('should return error for invalid or expired token', async () => {
            const req = { params: { token: 'invalidToken' } };
            const res = httpMocks.createResponse();

            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            console.log('Running test for invalid or expired token');
            await verifyEmail(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getData()).toBe('Invalid or expired link.');
            console.log('Test for invalid or expired token passed');
        });
    });

    describe('forgotPassword', () => {
        it('should send password reset email', async () => {
            const req = { body: { email: 'test@example.com' } };
            const res = httpMocks.createResponse();

            User.findOne.mockResolvedValue({
                _id: '1',
                email: 'test@example.com',
                save: jest.fn().mockResolvedValue(true)
            });

            console.log('Running test for sending password reset email');
            await forgotPassword(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getData()).toBe('Password reset email sent.');
            console.log('Test for sending password reset email passed');
        });

        it('should return error if email is not found', async () => {
            const req = { body: { email: 'unknown@example.com' } };
            const res = httpMocks.createResponse();

            User.findOne.mockResolvedValue(null);

            console.log('Running test for email not found in password reset');
            await forgotPassword(req, res);

            expect(res.statusCode).toBe(404);
            expect(res._getData()).toBe('No user with this email.');
            console.log('Test for email not found in password reset passed');
        });
    });

    describe('resetPassword', () => {
        it('should reset user password', async () => {
            const req = { params: { token: 'validToken' }, body: { password: 'newPassword123' } };
            const res = httpMocks.createResponse();

            User.findOne.mockResolvedValue({
                _id: '1',
                resetPasswordToken: 'validToken',
                resetPasswordExpires: Date.now() + 3600000,
                save: jest.fn().mockResolvedValue(true)
            });
            bcrypt.hash.mockResolvedValue('$2a$10$newhashedpassword');

            console.log('Running test for resetting user password');
            await resetPassword(req, res);

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData().message).toBe('Password reset successful, you can now log in with the new password.');
            console.log('Test for resetting user password passed');
        });

        it('should return error for invalid or expired token', async () => {
            const req = { params: { token: 'invalidToken' }, body: { password: 'newPassword123' } };
            const res = httpMocks.createResponse();

            User.findOne.mockResolvedValue(null);

            console.log('Running test for invalid or expired token in password reset');
            await resetPassword(req, res);

            expect(res.statusCode).toBe(400);
            expect(res._getJSONData().message).toBe('Invalid or expired token.');
            console.log('Test for invalid or expired token in password reset passed');
        });
    });
});



























// //backend/__test__/controllers/userController.test.js
// const {
//     registerUser,
//     loginUser,
//     getUserProfile,
//     updateUserProfile,
//     changePassword,
//     verifyEmail,
//     forgotPassword,
//     resetPassword
// } = require('../../controllers/userController');
// const User = require('../../models/User');
// const Event = require('../../models/Event');
// const httpMocks = require('node-mocks-http');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const { sendEmail } = require('../../utils/sendEmail');

// // Mocking the required modules
// jest.mock('../../models/User');
// jest.mock('../../models/Event');
// jest.mock('bcryptjs');
// jest.mock('jsonwebtoken');
// jest.mock('../../utils/sendEmail');

// describe('User Controller', () => {
//     beforeEach(() => {
//         jest.clearAllMocks();
//     });

//     describe('registerUser', () => {
//         it('should create a new user', async () => {
//             const req = { body: { username: 'testuser', email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User' } };
//             const res = httpMocks.createResponse();

//             User.findOne.mockResolvedValue(null);
//             bcrypt.hash.mockResolvedValue('hashedPassword');
//             jwt.sign.mockReturnValue('fakeToken');
//             User.prototype.save.mockResolvedValue({
//                 _id: "1",
//                 username: req.body.username,
//                 email: req.body.email,
//                 firstName: req.body.firstName,
//                 lastName: req.body.lastName,
//                 verified: true
//             });

//             console.log('Running test for creating a new user');
//             await registerUser(req, res);

//             expect(res.statusCode).toBe(201);
//             const responseData = res._getJSONData();
//             expect(responseData).toHaveProperty('user');
//             expect(responseData).toHaveProperty('token', 'fakeToken');
//             console.log('Test for creating a new user passed');
//         });

//         it('should not create a user if email already exists', async () => {
//             const req = { body: { username: 'testuser', email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User' } };
//             const res = httpMocks.createResponse();

//             User.findOne.mockResolvedValue(true);

//             console.log('Running test for email already exists');
//             await registerUser(req, res);

//             expect(res.statusCode).toBe(409);
//             expect(res._getJSONData()).toEqual({ msg: 'Email already exists' });
//             console.log('Test for email already exists passed');
//         });
//     });

//     describe('loginUser', () => {
//         it('should authenticate a verified user', async () => {
//             const req = httpMocks.createRequest({
//                 method: 'POST',
//                 url: '/login',
//                 body: { email: 'test@example.com', password: 'password123' }
//             });
//             const res = httpMocks.createResponse({
//                 eventEmitter: require('events').EventEmitter
//             });

//             User.findOne.mockResolvedValue({
//                 _id: '1',
//                 email: 'test@example.com',
//                 password: '$2a$10$examplehash',
//                 verified: true
//             });
//             bcrypt.compare.mockResolvedValue(true);
//             jwt.sign.mockImplementation((payload, secret, options) => 'fakeToken');

//             console.log('Running test for authenticated verified user');
//             await loginUser(req, res);

//             res.on('end', () => {
//                 expect(res.statusCode).toBe(200);
//                 expect(res._getJSONData()).toHaveProperty('token', 'fakeToken');
//                 console.log('Test for authenticated verified user passed');
//             });
//         });

//         it('should prevent login for unverified users', async () => {
//             const req = httpMocks.createRequest({
//                 method: 'POST',
//                 url: '/login',
//                 body: { email: 'test@example.com', password: 'password123' }
//             });
//             const res = httpMocks.createResponse();

//             User.findOne.mockResolvedValue({
//                 _id: '1',
//                 email: 'test@example.com',
//                 password: '$2a$10$examplehash',
//                 verified: false
//             });
//             bcrypt.compare.mockResolvedValue(true);

//             console.log('Running test for unverified user login prevention');
//             await loginUser(req, res);

//             expect(res.statusCode).toBe(401);
//             expect(res._getJSONData()).toEqual({ message: 'Authentication failed, user not found or not verified' });
//             console.log('Test for unverified user login prevention passed');
//         });
//     });

//     describe('getUserProfile', () => {
//         it('should retrieve a user profile', async () => {
//             const req = { user: { id: '1' } };
//             const res = httpMocks.createResponse();

//             const mockUser = {
//                 _id: '1',
//                 username: 'testUser',
//                 email: 'test@example.com',
//                 firstName: 'Test',
//                 lastName: 'User',
//                 toObject: jest.fn().mockReturnValue({
//                     _id: '1',
//                     username: 'testUser',
//                     email: 'test@example.com',
//                     firstName: 'Test',
//                     lastName: 'User'
//                 }),
//                 select: jest.fn().mockReturnThis()
//             };

//             User.findById.mockReturnValue(mockUser);
//             Event.find.mockResolvedValue([{ title: 'Event 1' }, { title: 'Event 2' }]);

//             console.log('Running test for retrieving user profile');
//             await getUserProfile(req, res);

//             const responseData = res._getJSONData();
//             expect(responseData).toHaveProperty('user');
//             expect(responseData).toHaveProperty('createdEvents');
//             expect(responseData).toHaveProperty('rsvpedEvents');
//             console.log('Test for retrieving user profile passed');
//         });
//     });

//     describe('updateUserProfile', () => {
//         it('should update a user profile', async () => {
//             const req = { user: { id: '1' }, body: { name: 'Updated Name', email: 'updated@example.com' } };
//             const res = httpMocks.createResponse();

//             User.findByIdAndUpdate.mockResolvedValue({
//                 _id: '1',
//                 name: 'Updated Name',
//                 email: 'updated@example.com',
//                 toObject: jest.fn().mockReturnValue({
//                     _id: '1',
//                     name: 'Updated Name',
//                     email: 'updated@example.com'
//                 })
//             });

//             console.log('Running test for updating user profile');
//             await updateUserProfile(req, res);

//             const responseData = res._getJSONData();
//             expect(responseData).toHaveProperty('_id', '1');
//             expect(responseData).toHaveProperty('email', 'updated@example.com');
//             console.log('Test for updating user profile passed');
//         });
//     });

//     describe('changePassword', () => {
//         it('should change a user password', async () => {
//             const req = { user: { id: '1' }, body: { currentPassword: 'currentPassword123', newPassword: 'newPassword123' } };
//             const res = httpMocks.createResponse();

//             User.findById.mockResolvedValue({
//                 _id: '1',
//                 password: '$2a$10$examplehash'
//             });
//             bcrypt.compare.mockResolvedValue(true);
//             bcrypt.hash.mockResolvedValue('$2a$10$newhashedpassword');

//             console.log('Running test for changing user password');
//             await changePassword(req, res);

//             expect(res.statusCode).toBe(200);
//             expect(res._getJSONData()).toEqual({ message: 'Password updated successfully' });
//             console.log('Test for changing user password passed');
//         });

//         it('should return error if current password is incorrect', async () => {
//             const req = { user: { id: '1' }, body: { currentPassword: 'wrongPassword', newPassword: 'newPassword123' } };
//             const res = httpMocks.createResponse();

//             User.findById.mockResolvedValue({
//                 _id: '1',
//                 password: '$2a$10$examplehash'
//             });
//             bcrypt.compare.mockResolvedValue(false);

//             console.log('Running test for incorrect current password');
//             await changePassword(req, res);

//             expect(res.statusCode).toBe(400);
//             expect(res._getJSONData()).toEqual({ error: 'Incorrect current password' });
//             console.log('Test for incorrect current password passed');
//         });
//     });

//     describe('verifyEmail', () => {
//         it('should verify user email', async () => {
//             const req = { params: { token: 'validToken' } };
//             const res = httpMocks.createResponse();

//             jwt.verify.mockResolvedValue({ id: '1' });
//             User.findById.mockResolvedValue({
//                 _id: '1',
//                 verified: false,
//                 save: jest.fn().mockResolvedValue(true)
//             });

//             console.log('Running test for verifying user email');
//             await verifyEmail(req, res);

//             expect(res.statusCode).toBe(200);
//             expect(res._getData()).toBe('Email successfully verified.');
//             console.log('Test for verifying user email passed');
//         });

//         it('should return error for invalid or expired token', async () => {
//             const req = { params: { token: 'invalidToken' } };
//             const res = httpMocks.createResponse();

//             jwt.verify.mockImplementation(() => {
//                 throw new Error('Invalid token');
//             });

//             console.log('Running test for invalid or expired token');
//             await verifyEmail(req, res);

//             expect(res.statusCode).toBe(400);
//             expect(res._getData()).toBe('Invalid or expired link.');
//             console.log('Test for invalid or expired token passed');
//         });
//     });

//     describe('forgotPassword', () => {
//         it('should send password reset email', async () => {
//             const req = { body: { email: 'test@example.com' } };
//             const res = httpMocks.createResponse();

//             User.findOne.mockResolvedValue({
//                 _id: '1',
//                 email: 'test@example.com',
//                 save: jest.fn().mockResolvedValue(true)
//             });

//             console.log('Running test for sending password reset email');
//             await forgotPassword(req, res);

//             expect(res.statusCode).toBe(200);
//             expect(res._getData()).toBe('Password reset email sent.');
//             console.log('Test for sending password reset email passed');
//         });

//         it('should return error if email is not found', async () => {
//             const req = { body: { email: 'unknown@example.com' } };
//             const res = httpMocks.createResponse();

//             User.findOne.mockResolvedValue(null);

//             console.log('Running test for email not found in password reset');
//             await forgotPassword(req, res);

//             expect(res.statusCode).toBe(404);
//             expect(res._getData()).toBe('No user with this email.');
//             console.log('Test for email not found in password reset passed');
//         });
//     });

//     describe('resetPassword', () => {
//         it('should reset user password', async () => {
//             const req = { params: { token: 'validToken' }, body: { password: 'newPassword123' } };
//             const res = httpMocks.createResponse();

//             User.findOne.mockResolvedValue({
//                 _id: '1',
//                 resetPasswordToken: 'validToken',
//                 resetPasswordExpires: Date.now() + 3600000,
//                 save: jest.fn().mockResolvedValue(true)
//             });
//             bcrypt.hash.mockResolvedValue('$2a$10$newhashedpassword');

//             console.log('Running test for resetting user password');
//             await resetPassword(req, res);

//             expect(res.statusCode).toBe(200);
//             expect(res._getJSONData().message).toBe('Password reset successful, you can now log in with the new password.');
//             console.log('Test for resetting user password passed');
//         });

//         it('should return error for invalid or expired token', async () => {
//             const req = { params: { token: 'invalidToken' }, body: { password: 'newPassword123' } };
//             const res = httpMocks.createResponse();

//             User.findOne.mockResolvedValue(null);

//             console.log('Running test for invalid or expired token in password reset');
//             await resetPassword(req, res);

//             expect(res.statusCode).toBe(400);
//             expect(res._getJSONData().message).toBe('Invalid or expired token.');
//             console.log('Test for invalid or expired token in password reset passed');
//         });
//     });
// });






