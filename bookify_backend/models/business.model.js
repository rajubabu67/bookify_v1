const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  firstName: { type: String, required: true }, // Owner's first name
  lastName: { type: String, required: true },  // Owner's last name
  businessName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  website: { type: String },
  description: { type: String },
  onlineBooking: { type: Boolean, default: false },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  practitioners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Practitioner' }],
  weeklySchedules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WeeklySchedule' }],
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);
