const express = require('express');
const router = express.Router();
const { getBusinessDetails } = require('../controllers/businessController');

// Route to fetch business details by ID
router.get('/:businessId', getBusinessDetails);

module.exports = router;
