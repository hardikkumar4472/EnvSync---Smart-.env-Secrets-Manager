const express = require('express');
const router = express.Router();
const cleanupController = require('../controllers/cleanup.controller');
const protect = require('../middleware/auth.middleware');

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// All cleanup routes require admin authentication
router.use(protect);
router.use(adminOnly);

/**
 * @route   POST /api/cleanup/run
 * @desc    Manually trigger cleanup of old audit logs
 * @access  Admin only
 */
router.post('/run', cleanupController.manualCleanup);

/**
 * @route   GET /api/cleanup/status
 * @desc    Get cleanup service status
 * @access  Admin only
 */
router.get('/status', cleanupController.getCleanupStatus);

module.exports = router;
