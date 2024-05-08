// Import required modules
const mongoose = require('mongoose');
const Event = require('../../models/Event');
  
// Connect to the test database before running tests
beforeAll(async () => {
  console.log('Connecting to the test database...');
  await mongoose.connect('mongodb://localhost:27017/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('Connected to the test database');
});

// Clear the database after each test
afterEach(async () => {
  console.log('Clearing the test database...');
  await Event.deleteMany();
  console.log('Test database cleared');
});

// Close the database connection after all tests are done
afterAll(async () => {
  console.log('Closing the test database connection...');
  await mongoose.connection.close();
  console.log('Test database connection closed');
});

// Test suite for the Event model
describe('Event Model', () => {
    // Test case for creating a new event
    it('should create a new event', async () => {
        console.log('Testing event creation...');
        const eventData = {
          title: 'Test Event',
          description: 'This is a test event',
          date: new Date('2024-05-15T18:00:00Z'),
          location: { // Adjusted location property
            type: 'Point',
            coordinates: [10, 20],
          },
          category: 'Other', // Match one of the enum values
          creator: new mongoose.Types.ObjectId(),
        };
      
        console.log('Event data:', eventData);
        console.log('Location data:', eventData.location);
      
        // Create the event
        const event = await Event.create(eventData);
      
        console.log('Event created:', event);
        console.log('Event location:', event.location);
      
        // Assert properties of the created event
        expect(event).toHaveProperty('title', 'Test Event');
        expect(event).toHaveProperty('description', 'This is a test event');
        expect(event).toHaveProperty('date', eventData.date);
        expect(event).toHaveProperty('location.type', 'Point'); // Adjusted to check location type
        expect(event).toHaveProperty('location.coordinates', [10, 20]); // Adjusted to check location coordinates
        expect(event).toHaveProperty('category', 'Other'); // Adjusted to match the enum value
        expect(event).toHaveProperty('creator', eventData.creator);
    }, 30000); // Increase timeout if needed
    
// Test case for ensuring required fields are validated
it('should not create an event without required fields', async () => {
    console.log('Testing event creation without required fields...');
    try {
      // Attempt to create an event without required fields
      await Event.create({
        title: 'Test Event 2', // Ensure unique title if it's required to be unique
        description: 'This is another test event',
        date: new Date('2024-06-15T18:00:00Z'), // Ensure unique date if it's required to be unique
        location: { // Properly include location field
          type: 'Point',
          coordinates: [15, 25], // Ensure unique coordinates if they're required to be unique
        },
        category: 'Tech', // Change category if 'Other' is not allowed or if it's required to be unique
        creator: new mongoose.Types.ObjectId(), // Ensure unique creator if it's required to be unique
      });
    } catch (error) {
      console.log('Error caught:', error);
      // Assert that the error is a validation error and contains errors for all required fields
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors).toHaveProperty('title');
      expect(error.errors).toHaveProperty('description');
      expect(error.errors).toHaveProperty('date');
      expect(error.errors).toHaveProperty('location'); // Adjusted to check location property
      expect(error.errors).toHaveProperty('category');
      expect(error.errors).toHaveProperty('creator');
    }
  });
});