const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const { jwtSecret } = process.env; // Use environment variable directly
const User = require('../../models/User');

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('password', 10);
    const user = await User.create({
        email: 'john.doe@example.com',
        password: passwordHash,
        username: 'john.doe',
        verified: true
    });
    createdUserId = user._id.toString(); 
    console.log('Created test user:', user);
    console.log('Using JWT Secret:', process.env.JWT_SECRET);
    token = jwt.sign(
        { id: createdUserId, username: 'john.doe' },
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
    );});

afterAll(async () => {
    await mongoose.disconnect();
});

describe('User Controller', () => {
    it('should create a new user', async () => {
        const userData = {
            username: 'newUser',
            email: 'newuser@example.com',
            password: 'password123'
        };

        const res = await request(app)
            .post('/api/users/register')
            .send(userData)
            .expect(201);

        expect(res.body).toHaveProperty('token');
    });

    it('should authenticate a user and return a token', async () => {
        const loginData = {
            email: 'john.doe@example.com',
            password: 'password'
        };

        const res = await request(app)
            .post('/api/users/login')
            .send(loginData);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should fetch user details', async () => {
        const res = await request(app)
            .get('/api/users/details')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body).toHaveProperty('username', 'john.doe');
    });

    it('should handle login errors', async () => {
        const loginData = {
            email: 'john.doe@example.com',
            password: 'wrongpassword'
        };

        const res = await request(app)
            .post('/api/users/login')
            .send(loginData);

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
});


describe('User Controller Tests', () => {
    let userId, token;

    beforeAll(async () => {
        // Create a new user and capture the user ID and token
        const registerResponse = await request(app)
            .post('/api/users/register')
            .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });
        expect(registerResponse.status).toBe(201);
        userId = registerResponse.body.user._id; // Adjust based on actual response structure
        token = registerResponse.body.token;
    });

    it('should update user details', async () => {
        const updateResponse = await request(app)
            .put(`/api/users/${userId}`)
            .send({ username: 'updatedTestUser' })
            .set('Authorization', `Bearer ${token}`); // Ensure the token is set correctly

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.user.username).toBe('updatedTestUser');
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });
});

 
// After all tests, disconnect from the database
afterAll(async () => {
    console.log('Disconnecting from database');
    await mongoose.disconnect();
});

