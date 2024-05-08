//__test__/controllers/userController.test.js
// Importing required modules
const { registerUser, loginUser, getUser, updateUser, deleteUser } = require('../../controllers/userController');
const User = require('../../models/User');
const httpMocks = require('node-mocks-http'); // Module to mock HTTP requests and responses
const bcrypt = require('bcryptjs'); // Module for hashing passwords
const jwt = require('jsonwebtoken'); // Module for creating JWTs

// Mocking the required modules
jest.mock('../../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Test suite for User Controller
describe('User Controller', () => {
    // Test suite for registerUser function
    describe('registerUser', () => {
        // Test case: Should create a new user
        it('should create a new user', async () => {
            // Mock request and response
            const req = { body: { username: 'testuser', email: 'test@example.com', password: 'password123' } };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
            
            // Mock User.findOne to return null (no user found)
            User.findOne.mockResolvedValue(null);
            // Mock User.prototype.save to return a new user
            User.prototype.save.mockResolvedValue({ id: "1", ...req.body });

            // Call the function with the mock request and response
            await registerUser(req, res);

            // Expectations: Should return status 201 and a JSON response
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.any(Object));
        });

        // Test case: Should not create a user if email already exists
        it('should not create a user if email already exists', async () => {
            // Mock request and response
            const req = { body: { username: 'testuser', email: 'test@example.com', password: 'password123' } };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

            // Mock User.findOne to return true (user found)
            User.findOne.mockResolvedValue(true);

            // Call the function with the mock request and response
            await registerUser(req, res);

            // Expectations: Should return status 409 and a JSON response with an error message
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Email already exists' });
        });
    });

    // Test suite for loginUser function
    describe('loginUser', () => {
        // Test case: Should authenticate a verified user
        it('should authenticate a verified user', async () => {
            // Mock request and response
            const req = httpMocks.createRequest({
                method: 'POST',
                url: '/login',
                body: {
                    email: 'test@example.com',
                    password: 'password123'
                }
            });
            const res = httpMocks.createResponse({
                eventEmitter: require('events').EventEmitter
            });

            // Mock User.findOne to return a verified user
            User.findOne.mockResolvedValue({
                _id: '1',
                email: 'test@example.com',
                password: '$2a$10$examplehash',
                verified: true
            });

            // Mock bcrypt.compare to return true (passwords match)
            bcrypt.compare.mockResolvedValue(true);
            // Mock jwt.sign to return a fake token
            jwt.sign.mockImplementation((payload, secret, options, callback) => callback(null, 'fakeToken'));

            // Call the function with the mock request and response
            await loginUser(req, res);

            // Expectations: Should return status 200 and a JSON response with a token
            res.on('end', () => {
                console.log('Response data:', res._getData()); 
                expect(res.statusCode).toBe(200);
                expect(res._getData()).toHaveProperty('token', 'fakeToken');
            });
        });

        // Test case: Should prevent login for unverified users
        it('should prevent login for unverified users', async () => {
            // Mock request and response
            const req = httpMocks.createRequest({
                method: 'POST',
                url: '/login',
                body: {
                    email: 'test@example.com',
                    password: 'password123'
                }
            });
            const res = httpMocks.createResponse();

            // Mock User.findOne to return an unverified user
            User.findOne.mockResolvedValue({
                _id: '1',
                email: 'test@example.com',
                password: '$2a$10$examplehash',
                verified: false
            });

            // Call the function with the mock request and response
            await loginUser(req, res);

            // Expectations: Should return status 401 and a JSON response with an error message
            expect(res.statusCode).toBe(401);
            expect(res._getJSONData()).toEqual({ message: 'Authentication failed, user not found or not verified' });
        });
    });

    // Test suite for updateUser function
    describe('updateUser', () => {
        // Test case: Should update a user successfully
        it('should update a user successfully', async () => {
            // Mock request and response
            const req = { params: { id: '1' }, body: { username: 'updatedUser', email: 'updated@example.com' } };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    
            // Mock User.findByIdAndUpdate to simulate returning an updated user
            User.findByIdAndUpdate.mockResolvedValue({
                _id: '1',
                username: 'updatedUser',
                email: 'updated@example.com'
            });
    
            // Call the function with the mock request and response
            await updateUser(req, res);
    
            // Expectations: Should return status 200 and a JSON response with a success message and the updated user
            expect(res.json).toHaveBeenCalledWith({
                message: "User updated successfully",
                user: {
                    _id: "1",
                    email: "updated@example.com",
                    username: "updatedUser",
                }
            });
            expect(res.status).toHaveBeenCalledWith(200);  
        });

        // Test case: Should return 404 if user not found
        it('should return 404 if user not found', async () => {
            // Mock request and response
            const req = { params: { id: '1' }, body: {} };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

            // Mock User.findByIdAndUpdate to return null (no user found)
            User.findByIdAndUpdate.mockResolvedValue(null);

            // Call the function with the mock request and response
            await updateUser(req, res);

            // Expectations: Should return status 404 and a JSON response with an error message
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });
    });

    // Test suite for getUser function
    describe('getUser', () => {
        // Test case: Should retrieve a user successfully
        it('should retrieve a user successfully', async () => {
            // Mock request and response
            const req = { params: { id: '1' } };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

            // Mock User.findById to return a user
            User.findById.mockResolvedValue({
                _id: '1',
                username: 'testUser',
                email: 'test@example.com'
            });

            // Call the function with the mock request and response
            await getUser(req, res);

            // Expectations: Should return a JSON response with the user and not status 404
            expect(res.json).toHaveBeenCalledWith(expect.any(Object));
            expect(res.status).not.toHaveBeenCalledWith(404);
        });

        // Test case: Should return 404 if user not found
        it('should return 404 if user not found', async () => {
            // Mock request and response
            const req = { params: { id: '1' } };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

            // Mock User.findById to return null (no user found)
            User.findById.mockResolvedValue(null);

            // Call the function with the mock request and response
            await getUser(req, res);

            // Expectations: Should return status 404 and a JSON response with an error message
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ msg: 'User not found' });
        });
    });

    // Test suite for deleteUser function
    describe('deleteUser', () => {
        // Test case: Should delete a user successfully
        it('should delete a user successfully', async () => {
            // Mock request and response
            const req = { params: { id: '1' } };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

            // Mock User.findByIdAndDelete to return a deleted user
            User.findByIdAndDelete.mockResolvedValue({
                _id: '1',
                username: 'testUser',
                email: 'test@example.com'
            });

            // Call the function with the mock request and response
            await deleteUser(req, res);

            // Expectations: Should return a JSON response with a success message and not status 404
            expect(res.json).toHaveBeenCalledWith({ msg: 'User deleted' });
            expect(res.status).not.toHaveBeenCalledWith(404);
        });

        // Test case: Should return 404 if user not found
        it('should return 404 if user not found', async () => {
            // Mock request and response
            const req = { params: { id: '1' } };
            const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

            // Mock User.findByIdAndDelete to return null (no user found)
            User.findByIdAndDelete.mockResolvedValue(null);

            // Call the function with the mock request and response
            await deleteUser(req, res);

            // Expectations: Should return status 404 and a JSON response with an error message
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ msg: 'User not found' });
        });
    });
});