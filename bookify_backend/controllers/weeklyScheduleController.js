const WeeklySchedule = require('../models/weeklySchedule.model');
const DailyBooking = require('../models/dailyBooking.model');

exports.addWeeklySchedule = async (req, res) => {
  try {
    const { businessId, practitionerId, schedule } = req.body;

    const newWeeklySchedule = new WeeklySchedule({
      businessId,
      practitionerId, 
      schedule
    });

    // Check if a schedule already exists for this practitioner
    const existingSchedule = await WeeklySchedule.findOne({ practitionerId });
    
    if (existingSchedule) {
      // Update existing schedule
      const updatedSchedule = await WeeklySchedule.findOneAndUpdate(
        { practitionerId },
        { $set: { schedule } },
        { new: true }
      );

      // If no schedule exists, create a new one
      if (!updatedSchedule) {
        const newSchedule = new WeeklySchedule({
          businessId,
          practitionerId,
          schedule
        });
        await newSchedule.save();
      }

      return res.status(200).json({
        message: 'Weekly schedule updated successfully',
        schedule: updatedSchedule
      });
    }

    const savedSchedule = await newWeeklySchedule.save();

    res.status(201).json({
      message: 'Weekly schedule created successfully',
      schedule: savedSchedule
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error creating weekly schedule',
      error: error.message
    });
  }
};

exports.getWeeklyScheduleById = async (req, res) => {
  try {
    const schedule = await WeeklySchedule.findById(req.params.scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: 'Weekly schedule not found' });
    }
    res.status(200).json({
      message: 'Weekly schedule retrieved successfully',
      schedule
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving weekly schedule',
      error: error.message
    });
  }
};

exports.getWeeklySchedulesByBusinessId = async (req, res) => {
  try {
    const schedules = await WeeklySchedule.find({ businessId: req.params.businessId });
    res.status(200).json({
      message: 'Weekly schedules retrieved successfully',
      schedules
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving weekly schedules',
      error: error.message
    });
  }
};

exports.getScheduleByDay = async (req, res) => {
  try {
    const { businessId, date } = req.params;
    
    // Convert date string to Date object and get day name
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[new Date(date).getDay()];

    // Find schedule for this business
    const schedule = await WeeklySchedule.findOne({ businessId });

    if (!schedule) {
      return res.status(404).json({
        message: 'No schedule found for this business'
      });
    }

    // Get slots for the specific day
    const timeSlots = schedule.schedule[dayName];

    res.status(200).json({
      message: 'Schedule retrieved successfully',
      schedule: {
        _id: schedule._id,
        timeSlots
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving schedule',
      error: error.message
    });
  }
};


exports.getWeeklySchedulesByPractitionerId = async (req, res) => {
  try {
    const schedules = await WeeklySchedule.find({ practitionerId: req.params.practitionerId });
    console.log(schedules);
    res.status(200).json({
      message: 'Weekly schedules retrieved successfully',
      schedules
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error retrieving weekly schedules',
      error: error.message
    });
  }
};

exports.changeIsBooked = async (req, res) => {
  try {
    const { scheduleId, dayName, startTime, endTime } = req.body;

    console.log("Changing is booked:", req.body);

    // Find the schedule for this practitioner
    const schedule = await WeeklySchedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({
        message: 'No schedule found for this practitioner'
      });
    }

    // Get the slots for the specified day
    const daySlots = schedule.schedule[dayName.toLowerCase()];

    // Find the matching time slot
    const slotIndex = daySlots.findIndex(slot => 
      slot.startTime === startTime && slot.endTime === endTime
    );

    if (slotIndex === -1) {
      return res.status(404).json({
        message: 'Time slot not found'
      });
    }

    // Update the isBooked status
    daySlots[slotIndex].isBooked = !daySlots[slotIndex].isBooked;

    // Save the updated schedule
    await schedule.save();

    res.status(200).json({
      message: 'Booking status updated successfully',
      slot: daySlots[slotIndex]
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error updating booking status',
      error: error.message
    });
  }
};

exports.updateWeeklySchedule = async (req, res) => {
  try {
    const updatedSchedule = await WeeklySchedule.findByIdAndUpdate(
      req.params.scheduleId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedSchedule) {
      return res.status(404).json({ message: 'Weekly schedule not found' });
    }
    res.status(200).json({
      message: 'Weekly schedule updated successfully',
      schedule: updatedSchedule
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating weekly schedule',
      error: error.message
    });
  }
};

exports.deleteTimeSlot = async (req, res) => {
console.log("Deleting time slot:", req.body);
  try {
    const { scheduleId, dayName, startTime, endTime } = req.body;

    const schedule = await WeeklySchedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({
        message: 'Weekly schedule not found'
      });
    }

    // console.log("Schedule:", schedule);

    const daySlots = schedule.schedule[dayName.toLowerCase()];
    
    // Find index of slot to delete
    const slotIndex = daySlots.findIndex(slot => 
      slot.startTime === startTime && slot.endTime === endTime
    );

    if (slotIndex === -1) {
      return res.status(404).json({
        message: 'Time slot not found'
      });
    }

    // Remove the slot
    daySlots.splice(slotIndex, 1);

    // Save the updated schedule
    await schedule.save();

    res.status(200).json({
      message: 'Time slot deleted successfully',
      schedule: schedule
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error deleting time slot',
      error: error.message
    });
  }
};

exports.getTimeSlotsBasedOnDayAndHost = async (req, res) => {
  try {

    const { date, hostId, businessId } = req.body;
    
    if (!date || !hostId) {
      return res.status(400).json({
        message: 'Date and host ID are required'
      });
    }

    // Convert date to day name
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    console.log("Day name:", dayName);

    // Find schedule for the host
    const schedule = await WeeklySchedule.findOne({ practitionerId: hostId });

    if (!schedule) {
      return res.status(404).json({
        message: 'No schedule found for this host'
      });
    }

    // Get slots for the specific day
    const slots = schedule.schedule[dayName];

    // Get all booked slots for this specific date
    const bookedSlots = await DailyBooking.find({
      practitionerId: hostId,
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
      }
    });

    // Create a set of booked time slots for quick lookup
    const bookedTimeSlots = new Set(bookedSlots.map(booking => booking.timeSlot));

    // Filter out booked slots based on actual date-specific bookings
    const availableSlots = slots.filter(slot => {
      const slotTimeString = `${slot.startTime} - ${slot.endTime}`;
      return !bookedTimeSlots.has(slotTimeString);
    });

    console.log("Available slots:", availableSlots);

    res.status(200).json({
      message: 'Time slots retrieved successfully',
      slots: availableSlots
    });

    
  } catch (error) {
    console.log("Error retrieving time slots:", error);
    res.status(500).json({
      message: 'Error retrieving time slots',
      error: error.message
    });
  }
};