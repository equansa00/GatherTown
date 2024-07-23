const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '/home/equansa00/Downloads/GatherTown/backend/.env' });
const logger = require('../config/logger');

const password = 'password123';
const storedHash = '$2b$10$sWGrYJ6QT.zB5KJSOu6m../lKlN4Z/m9Gd79ztHBGob78xstxH9xe';

async function comparePasswords() {
    try {
        logger.info('Starting password comparison');
        logger.info('Password to compare:', password);
        logger.info('Stored hash:', storedHash);

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, storedHash);
        logger.info('Password comparison result:', isMatch);

        console.log('Password comparison result:', isMatch);
    } catch (error) {
        logger.error('Error comparing passwords:', error);
        console.error('Error comparing passwords:', error);
    }
}

comparePasswords();
