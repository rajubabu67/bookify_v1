const express = require('express');
const router = express.Router();
const {
  createSchedule,
  getScheduleByBusinessAndDate,
  updateSchedule,
  deleteSchedule,
  deleteTimeSlot,
  updateTimeSlotBookingStatus
} = require("../controllers/scheduleController");

// Create a new schedule for a business on a specific date
router.post('/create', createSchedule);

// Get schedule for a business and date
router.get('/:businessId/:date', getScheduleByBusinessAndDate);

// Update schedule (e.g., update time slots)
router.put('/edit/:scheduleId', updateSchedule);

// Delete a schedule
router.delete('/delete/:scheduleId', deleteSchedule);

// Delete a time slot from a schedule
router.delete('/delete-timeslot/:scheduleId', deleteTimeSlot);

// Update the isBooked property of a specific time slot in a schedule
router.put('/update-timeslot-status/:scheduleId', updateTimeSlotBookingStatus);

module.exports = router;
