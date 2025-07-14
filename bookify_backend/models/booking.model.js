// const mongoose = require('mongoose');

// const services = [
//   'Business Consultation',
//   'Strategy Session',
//   'Initial Meeting',
//   'Follow-up Consultation',
//   'Project Review'
// ];

// const bookingSchema = new mongoose.Schema({
//   business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true }, // Business owner
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, required: true },
//   phone: { type: String, required: true },
//   service: { type: String, enum: services, required: true },
//   date: { type: Date, required: true },
//   timeSlot: { type: String, required: true },
//   message: { type: String },
//   status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
//   onlineBooking: { type: Boolean, default: false },
//   notified: { type: Boolean, default: false }
// }, { timestamps: true });

// module.exports = mongoose.model('Booking', bookingSchema);

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  message: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  onlineBooking: { type: Boolean, default: false },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'Practitioner', required: true },
  notified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);