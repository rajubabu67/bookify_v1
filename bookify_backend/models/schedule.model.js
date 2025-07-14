const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  time: { type: String, required: true },  // Format: "HH:MM"
  isBooked: { type: Boolean, default: false }
});

const scheduleSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  date: { type: Date, required: true },
  timeSlots: [timeSlotSchema],
  isAvailable: { type: Boolean, default: true }  // To mark entire day as available/unavailable
}, { timestamps: true });
  
// Compound index to ensure unique schedule per business per date
scheduleSchema.index({ business: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
