const nodemailer = require('nodemailer');

const sendEmail = async ({from, to, subject, html }) => {
  // Setup the transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODE_SENDER_EMAIL,
      pass: process.env.NODE_SENDER_PASS,
    },
  });

  // Email options
  const mailOptions = {
    from,
    to,
    subject,
    html,
  };

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
