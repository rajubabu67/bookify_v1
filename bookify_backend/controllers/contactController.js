const Contact = require('../models/contact.model'); 
const sendEmail = require('../utils/sendMail');
const Business = require('../models/business.model');

const createContact = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message, businessId, phone } = req.body;

    // Validate required fields
    if (!email || !subject || !message) {
      return res.status(400).json({ error: 'Email, subject, and message are required.' });
    }

    // Create a new contact document
    const newContact = new Contact({
      firstName,
      lastName,
      email,
      subject,
      message,
      phone,
      business: businessId,
    });

    // Save the contact document to the database
    await newContact.save();

    // Prepare the email content
    const emailContent = `
      <div style="font-family: Poppins, sans-serif; color: #333; line-height: 1.6;">
        <div style="background-color: #f0f4f8; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #3b82f6; margin-bottom: 10px;">New Support Request</h2>
          <p style="margin: 0 0 10px 0;">You have received a new support request from <strong>${firstName} ${lastName}</strong>.</p>
          <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
          <p style="margin: 0 0 10px 0;"><strong>Message:</strong> ${message}</p>
          <p style="margin: 0 0 10px 0;"><strong>Phone:</strong> ${phone}</p>
          <p style="margin: 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></p>
        </div>
      </div>
    `;

    // Send the email
    try {
      await sendEmail({
        from: email,
        to: process.env.NODE_SENDER_EMAIL,
        subject: "Assistance and Support",
        html: emailContent
      });
      console.log('Support email sent successfully');
    } catch (error) {
      console.error('Failed to send support email:', error);
    }

    // Respond with the created contact
    res.status(201).json(newContact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createContact
};
