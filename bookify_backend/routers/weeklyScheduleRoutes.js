const express = require('express');
const router = express.Router();
const { addWeeklySchedule, getWeeklyScheduleById, getWeeklySchedulesByBusinessId, getWeeklySchedulesByPractitionerId, updateWeeklySchedule, changeIsBooked, deleteTimeSlot, getTimeSlotsBasedOnDayAndHost } = require('../controllers/weeklyScheduleController');

router.post('/add', addWeeklySchedule);
router.get('/get/:scheduleId', getWeeklyScheduleById);
router.get('/get/business/:businessId', getWeeklySchedulesByBusinessId);
router.post('/get/time-slots/bydayandhost', getTimeSlotsBasedOnDayAndHost);
router.get('/get/practitioner/:practitionerId', getWeeklySchedulesByPractitionerId);
router.put('/update/:scheduleId', updateWeeklySchedule);
router.put('/change-is-booked', changeIsBooked);
router.put('/delete-time-slot', deleteTimeSlot);    

module.exports = router;