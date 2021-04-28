const cron = require('node-cron');
const checkQueueJam = require('./checkQueueJam');
const populateMonitoringUnits = require('./populateMonitoringUnits');

module.exports.start = () => {
  // Runs every minute
  cron.schedule('* * * * *', async () => {
    await checkQueueJam();
    await populateMonitoringUnits.runJob();
  });
};
