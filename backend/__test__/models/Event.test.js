// backend/__test__/models/Event.test.js
const mongoose = require('mongoose');
const Event = require('../../models/Event');
const { addDays } = require('date-fns');  // Use date-fns to manipulate dates

// Connect to a specific test database
beforeAll(async () => {
    const uri = 'mongodb://localhost:27017/gathertownTest';  // Ensure this is your test database
    await mongoose.connect(uri);
    console.log('Connected to the test database');
});

// Clear the database after each test
afterEach(async () => {
    await Event.deleteMany();
});

// Disconnect from the database after all tests are done
afterAll(async () => {
    await mongoose.connection.close();
});

describe('Event Model', () => {
    it('should create a new event with valid data', async () => {
        const futureDate = addDays(new Date(), 10);  // Set the event date 10 days in the future
        const eventData = {
            title: 'Future Event',
            description: 'This is a future event',
            date: futureDate,
            location: { type: 'Point', coordinates: [10, 20] },
            category: 'Tech',
            creator: new mongoose.Types.ObjectId(),
            time: '14:00'
        };

        const event = await Event.create(eventData);
        expect(event).toHaveProperty('title', 'Future Event');
        expect(event.date).toEqual(futureDate);
    }, 10000);  // Increase timeout for this test

    it('should not create an event without required fields', async () => {
      try {
          await Event.create({});
      } catch (error) {
          const errorKeys = Object.keys(error.errors);
          expect(errorKeys).toContain('title');
          expect(errorKeys).toContain('date');
          expect(errorKeys).toContain('location.type');
          expect(errorKeys).toContain('location.coordinates');
          expect(errorKeys).toContain('category');
          expect(errorKeys).toContain('creator');
          expect(errorKeys).toContain('time');
      }
    }, 10000);  // Increase timeout for this test if necessary
    
});


// //backend/__test__/models/Event.test.js
// // Import required modules
// const mongoose = require('mongoose');
// const Event = require('../../models/Event');
  
// // Connect to the test database before running tests
// beforeAll(async () => {
//   console.log('Connecting to the test database...');
//   await mongoose.connect('mongodb://localhost:27017/test', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
//   console.log('Connected to the test database');
// });

// // Clear the database after each test
// afterEach(async () => {
//   console.log('Clearing the test database...');
//   await Event.deleteMany();
//   console.log('Test database cleared');
// });

// // Close the database connection after all tests are done
// afterAll(async () => {
//   console.log('Closing the test database connection...');
//   await mongoose.connection.close();
//   console.log('Test database connection closed');
// });

// // Test suite for the Event model
// describe('Event Model', () => {
//     // Test case for creating a new event
//     it('should create a new event', async () => {
//         console.log('Testing event creation...');
//         const eventData = {
//           title: 'Test Event',
//           description: 'This is a test event',
//           date: new Date('2024-05-15T18:00:00Z'),
//           location: { // Adjusted location property
//             type: 'Point',
//             coordinates: [10, 20],
//           },
//           category: 'Other', // Match one of the enum values
//           creator: new mongoose.Types.ObjectId(),
//           time: '12:00'
//         };
      
//         console.log('Event data:', eventData);
//         console.log('Location data:', eventData.location);
      
//         // Create the event
//         const event = await Event.create(eventData);
      
//         console.log('Event created:', event);
//         console.log('Event location:', event.location);
      
//         // Assert properties of the created event
//         expect(event).toHaveProperty('title', 'Test Event');
//         expect(event).toHaveProperty('description', 'This is a test event');
//         expect(event).toHaveProperty('date', eventData.date);
//         expect(event).toHaveProperty('location.type', 'Point'); // Adjusted to check location type
//         expect(event).toHaveProperty('location.coordinates', [10, 20]); // Adjusted to check location coordinates
//         expect(event).toHaveProperty('category', 'Other'); // Adjusted to match the enum value
//         expect(event).toHaveProperty('creator', eventData.creator);
//     }, 30000); // Increase timeout if needed
    
// // Test case for ensuring required fields are validated
// it('should not create an event without required fields', async () => {
//   console.log('Testing event creation without required fields...');
//   try {
//     // Attempt to create an event without required fields
//     await Event.create({
//       // Omit 'title' and 'time' to trigger validation errors
//       description: 'This is another test event',
//       date: new Date('2024-06-15T18:00:00Z'),
//       location: {
//         type: 'Point',
//         coordinates: [15, 25],
//       },
//       category: 'Tech',
//       creator: new mongoose.Types.ObjectId(),
//     });
//   } catch (error) {
//     console.log('Error caught:', error);
//     // Assert that the error is a validation error and contains errors for all required fields
//     expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
//     expect(error.errors).toHaveProperty('title'); // This field is missing and should trigger an error
//     expect(error.errors).toHaveProperty('time');  // This field is missing and should trigger an error
//   }
// });

// });