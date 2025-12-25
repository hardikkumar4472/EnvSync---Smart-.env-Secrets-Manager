const cleanupService = require('../services/cleanup.service');

/**
 * Manually trigger cleanup of old audit logs
 */
exports.manualCleanup = async (req, res) => {
  try {
    const result = await cleanupService.cleanupOldLogs();
    
    res.status(200).json({
      success: true,
      message: 'Cleanup completed successfully',
      deletedCount: result.deletedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Cleanup failed',
      error: error.message
    });
  }
};

/**
 * Get cleanup service status
 */
exports.getCleanupStatus = async (req, res) => {
  try {
    const status = cleanupService.getStatus();
    
    // Get count of logs that will be deleted in next cleanup
    const AuditLog = require('../models/audit-log.model');
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oldLogsCount = await AuditLog.countDocuments({
      createdAt: { $lt: twentyFourHoursAgo }
    });

    res.status(200).json({
      success: true,
      status: {
        ...status,
        oldLogsCount,
        retentionPeriod: '24 hours',
        cleanupFrequency: 'Every hour'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cleanup status',
      error: error.message
    });
  }
};
