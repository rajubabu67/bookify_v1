const express = require('express');
const router = express.Router();
const {register, login, sendVerificationCode} = require("../controllers/authController");

// Basic auth routes
router.post('/register', register);
router.post('/login', login);
module.exports = router;