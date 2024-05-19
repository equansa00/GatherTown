//backend/utils/sendVerificationEmail.js
const nodemailer = require('nodemailer');

const sendVerificationEmail = async (user, token) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const verificationUrl = `http://localhost:5000/api/verify/${token}`;

    let mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: user.email,
        subject: 'Please confirm your email',
        html: `Please click on the following link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a>`
    };

    await transporter.sendMail(mailOptions);
};
