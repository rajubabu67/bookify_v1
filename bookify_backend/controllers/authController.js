const Business = require('../models/business.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Register controller for Business
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, businessName, email, password, phone, address, website, description, onlineBooking } = req.body;
    
    // Check if business with this email already exists
    const existingBusiness = await Business.findOne({ email });
    if (existingBusiness) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new business
    const newBusiness = new Business({
      firstName,
      lastName,
      businessName,
      email,
      password: hashedPassword,
      phone,
      address,
      website,
      description,
      onlineBooking
    });

    let registeredUser = await newBusiness.save();

    res.status(201).json({user:registeredUser, message: 'Business registered successfully.'});
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if business exists
    const business = await Business.findOne({ email });
    if (!business) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, business.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect.' });
    }

    // Generate JWT
    const payload = {
      id: business._id,
      email: business.email,
      businessName: business.businessName
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "secretkey", {
      expiresIn: '7d'
    });

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: business._id,
        firstName: business.firstName,
        lastName: business.lastName,
        businessName: business.businessName,
        email: business.email,
        phone: business.phone,
        address: business.address,
        website: business.website,
        description: business.description,
        onlineBooking: business.onlineBooking
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};
