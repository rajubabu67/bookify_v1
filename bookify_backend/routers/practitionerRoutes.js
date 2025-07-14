const express = require('express');
const router = express.Router();
const practitionerController = require('../controllers/practitionerController');

// Add a new practitioner
router.post('/add', practitionerController.addPractitioner);

// Delete a practitioner
router.delete('/delete', practitionerController.deletePractitioner);

router.get('/get/:practitionerId', practitionerController.getPractitionerById);

router.get('/get/business/:businessId', practitionerController.getPractitionersByBusinessId);

module.exports = router;
