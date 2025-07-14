const Practitioner = require('../models/practitioner.model');
const Business = require('../models/business.model');
const Service = require('../models/services.model');

const addPractitioner = async (req, res) => {
  try {
    const { businessId, name, bio, email, phone, linkedServices } = req.body;

    // Validate required fields
    if (!businessId || !name || !bio || !linkedServices || linkedServices.length === 0) {
      return res.status(400).json({ message: 'Business ID, name, bio and at least one linked service are required' });
    }

    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Verify all services exist and belong to the business
    const services = await Service.findOne({ 
      businessId: businessId,
      serviceNames: { $all: linkedServices }
    });

    if (!services) {
      return res.status(400).json({ message: 'One or more invalid service IDs' });
    }

    // Create new practitioner
    const practitioner = new Practitioner({
      businessId,
      name,
      bio,
      email,
      phone,
      linkedServices: linkedServices  
    });

    // Save the practitioner
    const savedPractitioner = await practitioner.save();

    // Add practitioner reference to business
    await Business.findByIdAndUpdate(
      businessId,
      { $push: { practitioners: savedPractitioner._id } }
    );

    res.status(201).json(savedPractitioner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePractitioner = async (req, res) => {
  try {
    const { practitionerId, businessId } = req.body;

    if (!practitionerId || !businessId) {
      return res.status(400).json({ message: 'Practitioner ID and Business ID are required' });
    }

    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Delete practitioner
    const deletedPractitioner = await Practitioner.findByIdAndDelete(practitionerId);
    if (!deletedPractitioner) {
      return res.status(404).json({ message: 'Practitioner not found' });
    }

    // Remove practitioner reference from business
    await Business.findByIdAndUpdate(
      businessId,
      { $pull: { practitioners: practitionerId } }
    );

    res.status(200).json({ message: 'Practitioner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPractitionersByBusinessId = async (req, res) => {
  try {
    const practitioners = await Practitioner.find({ businessId: req.params.businessId });
    res.status(200).json({
      message: 'Practitioners retrieved successfully',
      practitioners
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving practitioners',
      error: error.message
    });
  }
};

const getPractitionerById = async (req, res) => {
  try {
    const practitioner = await Practitioner.findById(req.params.practitionerId);
    
    if (!practitioner) {
      return res.status(404).json({
        message: 'Practitioner not found'
      });
    }

    res.status(200).json({
      message: 'Practitioner retrieved successfully',
      practitioner
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving practitioner',
      error: error.message
    });
  }
};

module.exports = {
  addPractitioner,
  deletePractitioner,
  getPractitionersByBusinessId,
  getPractitionerById
};
