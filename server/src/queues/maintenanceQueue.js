const { Queue } = require('bullmq');
const { redisConnection } = require('../config/redis');

const maintenanceQueue = new Queue('maintenance', {
  connection: redisConnection
});

const initMaintenanceJobs = async () => {
  // Clear existing repeatable jobs to avoid duplicates on restart
  const repeatableJobs = await maintenanceQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await maintenanceQueue.removeRepeatableByKey(job.key);
  }

  // Add cleanup job to run every hour
  await maintenanceQueue.add('cleanupLogs', {}, {
    repeat: {
      pattern: '0 * * * *' // Every hour
    },
    removeOnComplete: true
  });

  console.log('Maintenance: Scheduled repeatable cleanup job (Every Hour)');
};

module.exports = {
  maintenanceQueue,
  initMaintenanceJobs
};
