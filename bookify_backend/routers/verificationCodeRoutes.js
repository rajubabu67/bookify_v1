const express = require('express');
const router = express.Router();
const {createVerificationCode, verifyCode} = require('../controllers/verificationCodeController');
// Route to send verification code
router.post('/send', createVerificationCode);
router.delete('/verify', verifyCode);

module.exports = router;
