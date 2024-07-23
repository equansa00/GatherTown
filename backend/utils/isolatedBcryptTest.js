// isolatedBcryptTest.js
const bcrypt = require('bcryptjs');

console.log('bcrypt version:', require('bcryptjs/package.json').version);

const password = 'password123';
const storedHash = '$2b$10$sWGrYJ6QT.zB5KJSOu6m../lKlN4Z/m9Gd79ztHBGob78xstxH9xe';

async function testBcrypt() {
    try {
        // Hash the password
        const newHash = await bcrypt.hash(password, 10);
        console.log('Newly hashed password:', newHash);

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, storedHash);
        console.log('Password comparison result:', isMatch);
    } catch (error) {
        console.error('Error in bcrypt operations:', error);
    }
}

testBcrypt();
