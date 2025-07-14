const Schedule = require('../models/schedule.model');
const Business = require('../models/business.model');
const mongoose = require("mongoose");

const scheduleExample = {
  business: "665f1b2c3a4d5e6f7a8b9c0d", // Business ObjectId
  date: "2025-06-04", // Date for the schedule (YYYY-MM-DD)
  timeSlots: [
    { time: "10:00 AM" },
    { time: "11:00 AM" },
    { time: "12:00 PM" },
    { time: "1:00 PM" },
    { time: "2:00 PM" }
  ]
};

// Add a single time slot to a business's schedule for a specific date
exports.createSchedule = async (req, res) => {
  try {
    const { business, date, timeSlots } = req.body;

    if (!business || !date || !timeSlots) {
      return res.status(400).json({ message: "Business, date, and timeSlots are required." });
    }

    // Verify if the business id exists in the database
    const businessExists = await Business.findById(business);
    if (!businessExists) {
      return res.status(404).json({ message: "Business not found." });
    }

    // Format date to yyyy-mm-dd
    // Add 12 hours and set time to 00:00:00.000
    const normalizedDate = new Date(date);
    normalizedDate.setHours(12, 0, 0, 0);

    // Check if a schedule already exists for this business and date
    let schedule = await Schedule.findOne({
      business,
      date: normalizedDate
    });

    if (schedule) {
      // Check if the time already exists in the schedule
      const timeExists = schedule.timeSlots.some(slot => slot.time === timeSlots[0].time);
      if (timeExists) {
        return res.status(400).json({ message: "This time slot already exists for the schedule." });
      }
      // Append the new time slot
      schedule.timeSlots.push({ time: timeSlots[0].time });
      await schedule.save();
      return res.status(200).json({ message: "Time slot added to existing schedule.", schedule });
    } else {
      // Create a new schedule with the single time slot
      schedule = new Schedule({
        business,
        date: normalizedDate,
        timeSlots: [{ time: timeSlots[0].time   }]
      });
      await schedule.save();
      return res.status(201).json({ message: "Schedule created with new time slot.", schedule });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to add time slot to schedule.", error: error.message });
  }
};

exports.getScheduleByBusinessAndDate = async (req, res) => {
  try {
    const { businessId, date } = req.params;

    console.log(businessId, date);

    const normalizedDate = new Date(date);

    if (!businessId || !date) {
      return res.status(400).json({ message: "Business ID and date are required." });
    }

    // Find the schedule where the date falls within the day range
    const schedule = await Schedule.findOne({
      business: businessId,
      // Compare only the date part (year, month, day) ignoring the time
      $expr: {
        $and: [
          { $eq: [{ $year: "$date" }, normalizedDate.getUTCFullYear()] },
          { $eq: [{ $month: "$date" }, normalizedDate.getUTCMonth() + 1] }, // Mongo months are 1-based
          { $eq: [{ $dayOfMonth: "$date" }, normalizedDate.getUTCDate()] }
        ]
      }
    });

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found for this business and date." });
    }

    res.status(200).json({ schedule });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch schedule.", error: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { business, timeSlots } = req.body;

    if (!scheduleId || !business || !timeSlots) {
      return res.status(400).json({ message: "Schedule ID, business, and timeSlots are required." });
    }

    // Find the schedule
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    // Check if the business in req.body matches the schedule's business
    if (schedule.business.toString() !== business.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this schedule. Business ID mismatch." });
    }

    // Update the timeSlots
    schedule.timeSlots = timeSlots;
    await schedule.save();

    res.status(200).json({ message: "Schedule updated successfully.", schedule });
  } catch (error) {
    res.status(500).json({ message: "Failed to update schedule.", error: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { business } = req.body;

    if (!scheduleId || !business) {
      return res.status(400).json({ message: "Schedule ID and business are required." });
    }

    // Find the schedule
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    // Check if the business in req.body matches the schedule's business
    if (schedule.business.toString() !== business.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this schedule. Business ID mismatch." });
    }

    await Schedule.findByIdAndDelete(scheduleId);

    res.status(200).json({ message: "Schedule deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete schedule.", error: error.message });
  }
};


exports.deleteTimeSlot = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    // Accept businessId and timeSlotId from either body or query for flexibility
    const businessId = req.body.businessId 
    const timeSlotId = req.body.timeSlotId 

    console.log("This: ", scheduleId,businessId, timeSlotId);

    if (!scheduleId || !businessId || !timeSlotId) {
      return res.status(400).json({ message: "Schedule ID, businessId, and timeSlotId are required." });
    }

    // Validate scheduleId and timeSlotId as valid Mongo ObjectIds
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(scheduleId) || !mongoose.Types.ObjectId.isValid(timeSlotId) || !mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: "Invalid scheduleId, businessId, or timeSlotId." });
    }

    // Find the schedule
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    // Check if the business in req.body matches the schedule's business
    if (schedule.business.toString() !== businessId.toString()) {
      return res.status(403).json({ message: "You are not authorized to modify this schedule. Business ID mismatch." });
    }

    // Remove the time slot with the given timeSlotId
    const originalLength = schedule.timeSlots.length;
    schedule.timeSlots = schedule.timeSlots.filter(slot => slot._id.toString() !== timeSlotId.toString());

    if (schedule.timeSlots.length === originalLength) {
      return res.status(404).json({ message: "Time slot not found in schedule." });
    }

    // Ensure the date field is a valid Date object before saving
    if (schedule.date && typeof schedule.date === 'string') {
      schedule.date = new Date(schedule.date);
    }

    await schedule.save();

    res.status(200).json({ message: "Time slot deleted successfully.", schedule });
  } catch (error) {
    // If the error is a CastError related to date, handle it gracefully
    if (error.name === 'CastError' && error.path && error.path.startsWith('date')) {
      return res.status(400).json({ message: "Invalid date format in schedule document.", error: error.message });
    }
    res.status(500).json({ message: "Failed to delete time slot.", error: error.message });
  }
};


// Controller to update the isBooked property of a specific time slot in a schedule
exports.updateTimeSlotBookingStatus = async (req, res) => {
  try {
    const { scheduleId} = req.params;
    const { isBooked,businessId, timeSlotId  } = req.body;

    if (
      !scheduleId ||
      !businessId ||
      !timeSlotId ||
      typeof isBooked !== "boolean"
    ) {
      return res.status(400).json({
        message:
          "scheduleId, businessId, timeSlotId, and isBooked(boolean) are required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(scheduleId) ||
      !mongoose.Types.ObjectId.isValid(timeSlotId) ||
      !mongoose.Types.ObjectId.isValid(businessId)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid scheduleId, businessId, or timeSlotId." });
    }

    // Find the schedule
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found." });
    }

    // Check if the business matches
    if (schedule.business.toString() !== businessId.toString()) {
      return res.status(403).json({
        message:
          "You are not authorized to modify this schedule. Business ID mismatch.",
      });
    }

    // Find the time slot
    const slot = schedule.timeSlots.id(timeSlotId);
    if (!slot) {
      return res
        .status(404)
        .json({ message: "Time slot not found in schedule." });
    }

    slot.isBooked = isBooked;

    await schedule.save();

    res.status(200).json({
      message: "Time slot booking status updated successfully.",
      schedule,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update time slot booking status.",
      error: error.message,
    });
  }
};
