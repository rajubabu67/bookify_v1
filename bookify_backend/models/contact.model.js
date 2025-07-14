const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  phone: { type: String ,required: true},
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
