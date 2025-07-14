const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // Format: "HH:mm"
  endTime: { type: String, required: true },
  isBooked: { type: Boolean, default: false }
}, { _id: false });

const weeklyScheduleSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  practitionerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Practitioner', required: true },
  schedule: {
    sunday: { type: [slotSchema], default: [] },
    monday: { type: [slotSchema], default: [] },
    tuesday: { type: [slotSchema], default: [] },
    wednesday: { type: [slotSchema], default: [] },
    thursday: { type: [slotSchema], default: [] },
    friday: { type: [slotSchema], default: [] },
    saturday: { type: [slotSchema], default: [] }
  },
}, { timestamps: true });

module.exports = mongoose.model('WeeklySchedule', weeklyScheduleSchema);
