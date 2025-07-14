const Business = require('../models/business.model');

// Controller to fetch business details by ID
exports.getBusinessDetails = async (req, res) => {
  try {
    const { businessId } = req.params;
    if (!businessId) {
      return res.status(400).json({ message: 'Business ID is required.' });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found.' });
    }

    res.status(200).json({
      message: 'Business details fetched successfully.',
      business
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching business details.', error: error.message });
  }
};
