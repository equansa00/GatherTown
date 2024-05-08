// Importing required modules
const mongoose = require('mongoose');
const User = require('../../models/User');

// Test suite for User Model
describe('User Model Test', () => {
    // Before all tests, connect to the MongoDB database
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    // Before each test, delete all users from the database
    beforeEach(async () => {
        await User.deleteMany({});
    });

    // After all tests, disconnect from the MongoDB database
    afterAll(async () => {
        await mongoose.disconnect();
    });

    // Test case: Should create and save a user successfully
    it('create & save user successfully', async () => {
        const userData = { username: "newuser" + Date.now(), email: "test" + Date.now() + "@example.com", password: "password123" };
        const validUser = new User(userData);
        const savedUser = await validUser.save();

        // Expectations: The saved user should have an _id, and its email, username, and password should match the input data
        expect(savedUser._id).toBeDefined();
        expect(savedUser.email).toBe(userData.email);
        expect(savedUser.username).toBe(userData.username);
        expect(savedUser.password).toBe(userData.password);
    });

    // Test case: Should insert a user successfully, but the field not defined in schema should be undefined
    it('insert user successfully, but the field not defined in schema should be undefined', async () => {
        const userWithInvalidField = new User({ username: "newuser" + Date.now(), email: "test" + Date.now() + "@example.com", password: "password123", nickname: "Nick" });
        const savedUserWithInvalidField = await userWithInvalidField.save();

        // Expectations: The saved user should have an _id, but the nickname field should be undefined
        expect(savedUserWithInvalidField._id).toBeDefined();
        expect(savedUserWithInvalidField.nickname).toBeUndefined();
    });

    // Test case: Should fail to create a user without required fields
    it('create user without required field should fail', async () => {
        const userData = { username: "newuser" + Date.now() }; // Missing email and password fields
        try {
            await new User(userData).save();
        } catch (error) {
            // Expectations: The error should be a validation error, and it should have an email field
            expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
            expect(error.errors.email).toBeDefined();
        }
    });
});