const express = require('express');
const router = express.Router();
const {bookAppointment, editBooking, getBookingsByBusiness, editBookingStatus, getBookingById} = require("../controllers/bookingController");

router.post('/create/:businessId', bookAppointment);
router.put('/edit/:bookingId', editBooking);
router.get('/:businessId', getBookingsByBusiness);
router.patch('/:bookingId/status', editBookingStatus);
router.get('/get/:bookingId', getBookingById);

module.exports = router;