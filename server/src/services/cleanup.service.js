const cron = require('node-cron');
const AuditLog = require('../models/audit-log.model');

/**
 * Cleanup service to automatically delete audit logs older than 24 hours
 */
class CleanupService {
  constructor() {
    this.isRunning = false;
  }

  /**
   * Delete audit logs older than 24 hours
   */
  async cleanupOldLogs() {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const result = await AuditLog.deleteMany({
        createdAt: { $lt: twentyFourHoursAgo }
      });

      if (result.deletedCount > 0) {
        console.log(`✓ Cleanup: Deleted ${result.deletedCount} audit log(s) older than 24 hours`);
      } else {
        console.log('✓ Cleanup: No old audit logs to delete');
      }

      return result;
    } catch (error) {
      console.error('✗ Cleanup Error:', error.message);
      throw error;
    }
  }

  startScheduledCleanup() {
    if (this.isRunning) {
      console.log('⚠ Cleanup service is already running');
      return;
    }
    this.cronJob = cron.schedule('0 * * * *', async () => {
      console.log('⏰ Running scheduled audit log cleanup...');
      await this.cleanupOldLogs();
    });

    this.isRunning = true;
    console.log('✓ Audit log cleanup service started (runs every hour)');

    this.cleanupOldLogs().catch(err => {
      console.error('Initial cleanup failed:', err.message);
    });
  }

  /**
   * Stop the scheduled cleanup job
   */
  stopScheduledCleanup() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.isRunning = false;
      console.log('✓ Audit log cleanup service stopped');
    }
  }

  /**
   * Get cleanup service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.cronJob ? 'Every hour at minute 0' : 'Not scheduled'
    };
  }
}

module.exports = new CleanupService();
