const express = require('express');
const router = express.Router();
const { createContact } = require('../controllers/contactController');

// Route to handle creating a new contact
router.post('/create', createContact);

module.exports = router;
