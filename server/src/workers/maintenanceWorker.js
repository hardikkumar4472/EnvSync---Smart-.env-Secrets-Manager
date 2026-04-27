const { Worker } = require('bullmq');
const { redisOptions } = require('../config/redis');
const AuditLog = require('../models/audit-log.model');

const initMaintenanceWorker = () => {
  const worker = new Worker('maintenance', async job => {
    if (job.name === 'cleanupLogs') {
      console.log('Worker: Starting scheduled audit log cleanup...');
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = await AuditLog.deleteMany({
        createdAt: { $lt: twentyFourHoursAgo }
      });
      console.log(`Worker: Cleanup completed. Deleted ${result.deletedCount} logs.`);
      return result;
    }
  }, {
    connection: redisOptions
  });

  worker.on('failed', (job, err) => {
    console.error(`Maintenance job ${job?.id} failed: ${err.message}`);
  });

  console.log('Maintenance Worker initialized.');
};

module.exports = initMaintenanceWorker;
