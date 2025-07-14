const mongoose = require('mongoose');

const dailyBookingSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  practitionerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Practitioner', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // Format: "HH:mm - HH:mm"
  isBooked: { type: Boolean, default: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
}, { timestamps: true });

// Compound index to ensure unique booking per practitioner per date per time slot
dailyBookingSchema.index({ practitionerId: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('DailyBooking', dailyBookingSchema); 