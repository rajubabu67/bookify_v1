const mongoose = require('mongoose');

const practitionerSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  name: { type: String, required: true },
  bio: { type: String, required: true },
  email: { type: String ,required:true},    
  phone: { type: String },  
  linkedServices: { type: [String], required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Practitioner', practitionerSchema);
