const express = require('express');
const router = express.Router();
const { addService, getServices, deleteService } = require('../controllers/serviceController');

// Add a new service
router.post('/add', addService);
router.get('/get/:businessId', getServices);
router.patch('/delete', deleteService);

module.exports = router;
