const VerificationCode = require('../models/verificationCode.model');
const Business = require('../models/business.model');
const nodemailer = require('nodemailer');
// Function to create and store a verification code
exports.createVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    const business = await Business.findOne({ email });
    if (business) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Generate a random 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000);

    // Check if a verification code already exists for this email
    let verificationCode = await VerificationCode.findOne({ email });

    if (verificationCode) {
      // Update the existing code
      verificationCode.code = code;
    } else {
      // Create a new verification code entry
      verificationCode = new VerificationCode({ email, code });
    }

    // Save the verification code to the database
    await verificationCode.save();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.NODE_SENDER_EMAIL,
          pass: process.env.NODE_SENDER_PASS,
        },
      });
    
    // Email options
    const mailOptions = {
    from: process.env.NODE_SENDER_EMAIL,
    to: email,
    subject: 'Verification Code for Bookify Registration',
    html: `<p>Your verification code is: <b>${verificationCode.code}</b></p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);

    res.status(200).json({ message: 'Verification code created successfully.', code, email });
  } catch (error) {
    res.status(500).json({ message: 'Server error during verification code creation.', error: error.message });
  }
};

exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required.' });
    }
    const verificationCode = await VerificationCode.findOne({ email });
    if (!verificationCode) {
      return res.status(400).json({ message: 'Verification code not found.' });
    }

    if (verificationCode.code !== Number(code)) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }
    await verificationCode.deleteOne();
    res.status(200).json({ message: 'Verification code verified successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during verification code verification.', error: error.message });
  }
};