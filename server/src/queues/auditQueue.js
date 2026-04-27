const { Queue } = require('bullmq');
const { redisConnection } = require('../config/redis');

const auditQueue = new Queue('auditLogs', {
  connection: redisConnection
});

const addAuditJob = async (data) => {
  await auditQueue.add('log', data, {
    removeOnComplete: true,
    removeOnFail: {
      count: 1000 // Keep last 1000 failed jobs for debugging
    },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  });
};

module.exports = {
  auditQueue,
  addAuditJob
};
