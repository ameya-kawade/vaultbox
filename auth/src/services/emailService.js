const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.emailUser,
    pass: config.emailPassword
  }
});

const sendOTPEmail = async (to, otp) => {
  try {
    const mailOptions = {
      from: `Vaultbox <${config.emailUser}>`,
      to: to,
      subject: 'Your OTP for Vaultbox',
      html: `<p>Your OTP is: <strong>${otp}</strong></p><p>This OTP will expire in 5 minutes.</p>`
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendOTPEmail
};