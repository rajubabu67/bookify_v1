const Booking = require('../models/booking.model');
const cron = require('node-cron');
const Business = require('../models/business.model');
const { generateZoomMeeting } = require('../zoom.service');

 const scheduleReminders = async () => { 

     cron.schedule('*/20 * * * * *', async () => {

        console.log('I am getting triggered WOowowwwww');
        const now = new Date();

        // 🔁 24 hours later from now
        const targetDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        // 🔁 Extract date-only (ignoring time)
        const dateOnly = new Date(targetDateTime.toISOString().split("T")[0]);

        const startOfDay = new Date(dateOnly);
        const endOfDay = new Date(dateOnly);
        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1); // Move to next day (00:00 of next day)
        
        // ✅ Nepal time using proper timezone formatting
        const nepalTime = new Date(targetDateTime.getTime());

        // Format timeSlot in "HH:mm" format in Nepal time
        const timeSlotStart = nepalTime.toLocaleTimeString('en-GB', {
            timeZone: 'Asia/Kathmandu',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        // Add 1 hour to get end time
        const timeSlotEnd = new Date(nepalTime.getTime() + 60 * 60 * 1000).toLocaleTimeString('en-GB', {
            timeZone: 'Asia/Kathmandu',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        console.log(startOfDay,endOfDay,timeSlotStart, timeSlotEnd);
        
        const upcomingEvents = await Booking.find({
            notified: false,
            onlineBooking: true,
            status: "confirmed",
            date: { $gte: startOfDay, $lt: endOfDay },
            timeSlot: { $gte: timeSlotStart, $lt: timeSlotEnd }
        });
        console.log(upcomingEvents);

        for (const event of upcomingEvents) {
            if(event.notified) continue;
            event.notified = true;
            await event.save(); // ✅ Persist the "notified" flag
            const businessDetails = await Business.findById(event.business);
            // console.log(event,businessDetails);
            await generateZoomMeeting(event, businessDetails);
        }   
    })
}

scheduleReminders()