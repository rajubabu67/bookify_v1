const cron = require('node-cron');
// const events = require('./events'); // A list of upcoming events

// Simulate your database of events
const upcomingEvents = [
  { name: 'My Event', time: new Date('2025-06-11T06:39:30') } // 25 hrs from now
];

// Function to check and trigger if 24 hrs left
const checkEvents = () => {
  const now = new Date();
  upcomingEvents.forEach(event => {
    const timeDiff = event.time - now;
    if (timeDiff < 24 * 60 * 60 * 1000 && timeDiff > 23.9 * 60 * 60 * 1000) {
      console.log(`🔔 Triggering event: ${event.name}`);
      // Trigger your event (email, API call, etc.)
    }
  });
};

// Runs every 5 minutes
cron.schedule('*/5 * * * *', () => {
  console.log('⏰ Checking events...');
  checkEvents();
});
