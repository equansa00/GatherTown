//backend/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    console.log("Email transporter setup initiated...");

    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',  // Explicitly specify the host
        port: 465,               // Use SSL
        secure: true,            // Use SSL
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS
        }
    });

    // Setup email data with unicode symbols
    const mailOptions = {
        from: `"GatherTown" <${process.env.EMAIL_USER}>`,  // Sender address
        to: options.to,          // List of receivers
        subject: options.subject, // Subject line
        text: options.text,      // Plain text body
        html: options.html       // HTML body content
    };

    console.log(`Attempting to send email to ${options.to}...`);

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully: Message ID: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
};

module.exports = { sendEmail };
