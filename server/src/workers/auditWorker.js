const Queue = require('bull');
const { REDIS_URL } = require('../config/redis');
const AuditLog = require('../models/audit-log.model');
const mongoose = require('mongoose');

const initAuditWorker = () => {
  const worker = new Queue('auditLogs', REDIS_URL);
  
  worker.process(5, async job => {
    const { user, action, projectId, environment, ipAddress, details } = job.data;
    if (mongoose.connection.readyState !== 1) {
      console.warn('Worker: DB not connected, waiting...');
      return;
    }

    try {
      await AuditLog.create({
        userId: user.id,
        role: user.role,
        action,
        projectId,
        environment,
        ipAddress,
        details,
      });
    } catch (err) {
      console.error(`Worker Failed to log audit for job ${job.id}:`, err.message);
      throw err; // BullMQ will handle retries
    }
  });

  worker.on('completed', job => {
  });

  worker.on('failed', (job, err) => {
    console.error(`Audit job ${job?.id} failed with error: ${err.message}`);
  });

  console.log('Audit Worker initialized and listening for jobs...');
};

module.exports = initAuditWorker;
