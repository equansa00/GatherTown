// /home/equansa00/Desktop/GatherTown/db.js
// const mongoose = require('mongoose');

// let database = null;

// mongoose.connection.on('connected', () => {
//     console.log('MongoDB connected successfully');
// });

// mongoose.connection.on('error', (err) => {
//     console.error('MongoDB connection error:', err);
// });

// mongoose.connection.on('disconnected', () => {
//     console.log('MongoDB disconnected');
// });

// const connectDB = async () => {
//     if (!database) {
//         console.log('Attempting to connect to MongoDB...');
//         database = await mongoose.connect(process.env.MONGO_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true
//         });
//         console.log('MongoDB Connected');
//     }
// };

// const disconnectDB = async () => {
//     if (database) {
//         console.log('Disconnecting MongoDB...');
//         await mongoose.disconnect();
//         database = null;
//         console.log('MongoDB disconnected.');
//     }
// };

// module.exports = { connectDB, disconnectDB };


const mongoose = require('mongoose');

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

const connectDB = async () => {
    if (mongoose.connection.readyState === 0) {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,  // Optional based on your MongoDB driver version
            useUnifiedTopology: true  // Optional based on your MongoDB driver version
        });
        console.log('MongoDB Connected');
    }
};

const disconnectDB = async () => {
    if (mongoose.connection.readyState !== 0) {
        console.log('Disconnecting MongoDB...');
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
};

module.exports = { connectDB, disconnectDB };
