const Queue = require('bull');
const { REDIS_URL } = require('../config/redis');
const AuditLog = require('../models/audit-log.model');

const initMaintenanceWorker = () => {
  const maintenanceQueue = new Queue('maintenance', REDIS_URL);

  maintenanceQueue.process('cleanupLogs', async job => {
    console.log('Worker: Starting scheduled audit log cleanup...');
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await AuditLog.deleteMany({
      createdAt: { $lt: twentyFourHoursAgo }
    });
    console.log(`Worker: Cleanup completed. Deleted ${result.deletedCount} logs.`);
    return result;
  });

  maintenanceQueue.on('failed', (job, err) => {
    console.error(`Maintenance job ${job?.id} failed: ${err.message}`);
  });

  console.log('Maintenance Worker initialized.');
};

module.exports = initMaintenanceWorker;
