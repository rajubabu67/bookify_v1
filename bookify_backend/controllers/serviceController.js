const Service = require('../models/services.model');
const Business = require('../models/business.model');

const addService = async (req, res) => {
  try {
    const { businessId, serviceNames } = req.body;

    // Validate required fields
    if (!businessId || !serviceNames || serviceNames.length === 0) {
      return res.status(400).json({ message: 'Business ID and at least one service name are required' });
    }

    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Find existing service for this business
    let service = await Service.findOne({ businessId });
    
    // Check for duplicate service names
    if (service) {
      const duplicateServices = serviceNames.filter(name => 
        service.serviceNames.includes(name)
      );
      
      if (duplicateServices.length > 0) {
        return res.status(400).json({ 
          message: 'Some services already exist',
          duplicates: duplicateServices
        });
      }
    }

    if (service) {
      // Add new service names to existing list
      service.serviceNames.push(...serviceNames);
    } else {
      // Create new service if none exists
      service = new Service({
        businessId,
        serviceNames
      });
    }

    // Save the service
    const savedService = await service.save();

    // Add service reference to business
    await Business.findByIdAndUpdate(
      businessId,
      { $push: { services: savedService._id } }
    );

    res.status(201).json(savedService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getServices = async (req, res) => {
  try {
    const { businessId } = req.params;
    console.log(businessId);
    

    if (!businessId) {
      return res.status(400).json({ message: 'Business ID is required' });
    }

    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Get services for the business
    const services = await Service.find({ businessId });
    res.status(200).json(services);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const { serviceName, businessId } = req.body;

    if (!serviceName || !businessId) {
      return res.status(400).json({ message: 'Service Name and Business ID are required' });
    }

    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Delete service
    const deletedService = await Service.findOne({ 
      businessId: businessId,
      serviceNames: { $in: [serviceName] }
    });
    if (!deletedService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Remove service name from service document
    await Service.findByIdAndUpdate(
      deletedService._id,
      { $pull: { serviceNames: serviceName } }
    );

    // If no service names left, delete the service document
    const updatedService = await Service.findById(deletedService._id);
    if (updatedService.serviceNames.length === 0) {
      await Service.findByIdAndDelete(deletedService._id);
      await Business.findByIdAndUpdate(
        businessId,
        { $pull: { services: deletedService._id } }
      );
    }

    res.status(200).json({ message: 'Service deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  addService,
  getServices,
  deleteService
};
