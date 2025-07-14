const Booking = require('../models/booking.model');
const DailyBooking = require('../models/dailyBooking.model');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const Business = require('../models/business.model');
const nodemailer = require('nodemailer');
const Practitioner = require('../models/practitioner.model');
const WeeklySchedule = require('../models/weeklySchedule.model');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODE_SENDER_EMAIL,
    pass: process.env.NODE_SENDER_PASS
  }
});
// Controller to book an appointment

const sendEmail = require('../utils/sendMail');

const sendBookingConfirmationEmail = async (booking, businessDetails,hostDetails) => {
  const professionalHTML = fs.readFileSync(path.join(__dirname, '../utils/emailTemplate.html'), 'utf8');
  const template = handlebars.compile(professionalHTML);

  const simplifiedDate = new Date(booking?.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  console.log("Booking:", booking);
  console.log("Business details:", businessDetails);
  console.log("Host details:", hostDetails);

  const replacements1 = {
    firstName: booking?.firstName,
    lastName: booking?.lastName,
    date: simplifiedDate,
    timeSlot: booking?.timeSlot,
    businessName: businessDetails?.businessName,
    phone: hostDetails?.phone,
    email: hostDetails?.email,
    meetingType: booking?.onlineBooking ? 'Online' : 'In-Person',
    hostName: hostDetails?.name,
  };  

  const replacements2 = {
    firstName: booking?.firstName,
    lastName: booking?.lastName,
    date: simplifiedDate,
    timeSlot: booking?.timeSlot,
    businessName: businessDetails?.businessName,
    phone: booking?.phone,
    email: booking?.email,
    meetingType: booking?.onlineBooking ? 'Online' : 'In-Person',
    hostName: hostDetails?.name,
  };  

  await sendEmail({ to: booking?.email, subject: 'Appointment Booked Successfully', html: template(replacements1) });
  await sendEmail({ to: hostDetails?.email, subject: 'New Booking Added', html: template(replacements2) });
};

exports.bookAppointment = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      date,
      timeSlot,
      message,
      onlineBooking,
      host
    } = req.body;

    const business = req.params.businessId;

    const dayName = new Date(new Date(date).setDate(new Date(date).getDate() - 1)).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    const schedule = await WeeklySchedule.findOne({ practitionerId: host, businessId: business });
    console.log("Schedule:", schedule);
    if (!schedule) {
      return res.status(404).json({ message: 'Host schedule not found' });
    }

    // Basic validation
    if (!business || !firstName || !lastName || !email || !phone || !host || !date || !timeSlot) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    // Check for double booking using date-specific bookings
    const existingDailyBooking = await DailyBooking.findOne({
      practitionerId: host,
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
      },
      timeSlot: timeSlot
    });
    if (existingDailyBooking) {
      return res.status(409).json({ message: 'This time slot is already booked for the selected host on this date.' });
    }

    const businessDetails = await Business.findById(business);
    if (!businessDetails) {
      return res.status(404).json({ message: 'Business not found.' });
    }

    // Create and save the booking
    const newBooking = new Booking({
      business,
      firstName,
      lastName,
      email,
      phone,
      date: new Date(date),
      timeSlot,
      message,
      onlineBooking,
      host
    });

    const savedBooking = await newBooking.save();

    // Create a date-specific booking record instead of modifying weekly schedule
    const dailyBooking = new DailyBooking({
      businessId: business,
      practitionerId: host,
      date: new Date(date),
      timeSlot: timeSlot,
      isBooked: true,
      bookingId: savedBooking._id
    });

    await dailyBooking.save();
    console.log('Daily booking record created successfully:', dailyBooking);

    // Fetch host details
    const hostDetails = await Practitioner.findById(host);
    if (!hostDetails) {
      return res.status(404).json({ message: 'Host practitioner not found.' });
    }
    

    await sendBookingConfirmationEmail(savedBooking, businessDetails,hostDetails);

    res.status(201).json({
      message: 'Appointment booked successfully. Please check your email for further confirmation.',
      booking: savedBooking
    });
  } catch (error) {
    console.error('Error in bookAppointment:', error);
    res.status(500).json({ message: 'Server error while booking appointment.', error: error.message });
  }
};

// Edit booking date and time (only the associated business can change this)
exports.editBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { date, timeSlot, business } = req.body;

    if (!bookingId || !date || !timeSlot || !business) {
      return res.status(400).json({ message: 'Booking ID, date, timeSlot, and business are required.' });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Check if the business in req.body matches the booking's business
    if (booking.business.toString() !== business.toString()) {
      return res.status(403).json({ message: 'You are not authorized to edit this booking. Business ID mismatch.' });
    }

    // Check if the new slot is already booked for this business
    const existingBooking = await Booking.findOne({
      _id: { $ne: bookingId },
      business: business,
      date: new Date(date),
      timeSlot
    });
    if (existingBooking) {
      return res.status(409).json({ message: 'This time slot is already booked.' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { date: new Date(date), timeSlot },
      { new: true }
    );

    res.status(200).json({
      message: 'Booking updated successfully.',
      booking: updatedBooking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating booking.', error: error.message });
  }
};

// Edit booking status (only the associated business can confirm, anyone can cancel)
exports.editBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { business, status } = req.body;

    if (!bookingId || !status) {
      return res.status(400).json({ message: 'Booking ID and new status are required.' });
    }

    // Only allow valid status values
    const allowedStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // If trying to confirm, only the business can do this
    if (status === 'confirmed') {
      if (!business) {
        return res.status(400).json({ message: 'Business ID is required to confirm a booking.' });
      }
      if (booking.business.toString() !== business.toString()) {
        return res.status(403).json({ message: 'You are not authorized to confirm this booking. Business ID mismatch.' });
      }
    }

    // If trying to cancel, anyone can do it (no business check)
    // If trying to set to pending, you may want to restrict this, but for now, allow anyone

    booking.status = status;
    await booking.save();

    // If booking is cancelled, remove the daily booking record
    if (status === 'cancelled') {
      await DailyBooking.findOneAndDelete({
        bookingId: booking._id
      });
    }

    // Send email notification if booking is confirmed
    if (status === 'confirmed' ) {
     
      const customerEmail = booking.email;
      const customerName = `${booking.firstName} ${booking.lastName}`;
      const date = booking.date;
      const timeSlot = booking.timeSlot;

      // Compose email
      const mailOptions = {
        from: process.env.NODE_SENDER_EMAIL || 'no-reply@bookify.com',
        to: customerEmail,
        subject: 'Your Booking is Confirmed!',
        text: `Hello ${customerName},

        Your booking on ${new Date(date).toLocaleDateString()} at ${timeSlot} has been <b>CONFIRMED.<b>

        Thank you for booking with us!

        Best regards,
        Bookify Team
        `,
                html: `<p>Hello ${customerName},</p>
        <p>Your booking on <strong>${new Date(date).toLocaleDateString()}</strong> at <strong>${timeSlot}</strong> has been <span style="color:green;font-weight:bold;">CONFIRMED</span>.</p>
        <p>Thank you for booking with us!</p>
        <p>Best regards,<br/>Bookify Team</p>`
      };

      // Send the email (ignore errors, don't block response)
      if (typeof transporter !== 'undefined') {
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error('Error sending confirmation email:', err);
          } else {
            console.log('Confirmation email sent:', info.response);
          }
        });
      }
    }

    if(status === 'cancelled'){
      const customerEmail = booking.email;
      const customerName = `${booking.firstName} ${booking.lastName}`;
      const date = booking.date;
      const timeSlot = booking.timeSlot;

      // Compose email for cancellation
      const mailOptions = {
        from: process.env.NODE_SENDER_EMAIL || 'no-reply@bookify.com',
        to: customerEmail,
        subject: 'Your Booking has been Cancelled',
        text: `Hello ${customerName},

        We regret to inform you that your booking on ${new Date(date).toLocaleDateString()} at ${timeSlot} has been <b>CANCELLED.<b>

        We sincerely apologize for any inconvenience this may have caused. If you did not request this cancellation or would like to reschedule, please contact us immediately and we'll be happy to assist you.

        Thank you for your understanding.

        Best regards,
        Bookify Team
        `,
        html: `<p>Hello ${customerName},</p>
        <p>We regret to inform you that your booking on <strong>${new Date(date).toLocaleDateString()}</strong> at <strong>${timeSlot}</strong> has been <span style="color:red;font-weight:bold;">CANCELLED</span>.</p>
        <p>We sincerely apologize for any inconvenience this may have caused.</p>
        <p>If you did not request this cancellation or would like to reschedule, please contact us immediately and we'll be happy to assist you.</p>
        <p>Thank you for your understanding.</p>
        <p>Best regards,<br/>Bookify Team</p>`
      };

      // Send the email (ignore errors, don't block response)
      if (typeof transporter !== 'undefined') {
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.error('Error sending cancellation email:', err);
          } else {
            console.log('Cancellation email sent:', info.response);
          }
        });
      }
    }

    res.status(200).json({
      message: `Booking status updated to '${status}' successfully.`,
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating booking status.', error: error.message });
  }
};

// Get all bookings for a specific business
exports.getBookingsByBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    if (!businessId) {
      return res.status(400).json({ message: 'Business ID is required.' });
    }

    const bookings = await Booking.find({ business: businessId }).sort({ date: -1, timeSlot: 1 });
    

    res.status(200).json({
      message: 'Bookings fetched successfully.',
      bookings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching bookings.', error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.status(200).json({
      message: 'Booking fetched successfully.',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching booking.', error: error.message });
  }
};
