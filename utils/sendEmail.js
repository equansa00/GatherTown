//home/equansa00/Desktop/GatherTown/utils/sendEmail.js
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// Configure the OAuth2 client with your Google application's credentials
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

// Attempt to set credentials using the refresh token
if (process.env.REFRESH_TOKEN) {
    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN
    });
    console.log("OAuth2 client initialized with refresh token.");
} else {
    console.error("No refresh token available in environment variables.");
}

// Function to refresh the access token using the OAuth2 client
async function refreshAccessToken() {
    console.log("Attempting to refresh the access token...");
    try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);
        console.log("Access token refreshed successfully:", credentials.access_token);
        return credentials.access_token;
    } catch (error) {
        console.error('Failed to refresh access token:', error);
        throw new Error('Failed to refresh access token.');
    }
}

// Function to send an email using the refreshed access token
const sendEmail = async (options) => {
    console.log("Refreshing access token for email sending...");
    try {
        const accessToken = await refreshAccessToken();
        console.log("Email transporter setup initiated...");
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'capstoneumass@gmail.com',
        pass: 'aqvs hjds eahp jxyd' 
    }
});

        console.log(`Configuring email options for ${process.env.EMAIL_USER}...`);
        const mailOptions = {
            from: `GatherTown <${process.env.EMAIL_USER}>`,  // Using the environment variable
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        };

        console.log(`Attempting to send email to ${options.to}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully: Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('Failed to send email:', error);
        console.error(`Details: ${error.message}`);
        if (error.code === 'EAUTH') {
            console.error('Authentication error. Please verify Gmail settings and credentials.');
        }
        throw error;
    }
};

module.exports = { sendEmail };
