const AuditLog = require("../models/audit-log.model");
const User = require("../models/envsync_user.model");
const { logAudit } = require("../utils/audit");

/**
 * List audit logs
 * Admins see all logs, regular users see only their own
 */
exports.listAuditLogs = async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { userId: req.user.id };
    
    const logs = await AuditLog.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(1000);

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};

/**
 * Report a secret leak attempt from the CLI shield
 */
exports.reportSecretLeak = async (req, res) => {
  try {
    const { details, projectId, environment } = req.body;
    
    await logAudit({
      user: { id: req.user.id, role: req.user.role },
      action: "SECRET_LEAK_PREVENTED",
      details,
      projectId,
      environment,
      ipAddress: req.ip
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error reporting leak:", error);
    res.status(500).json({ message: "Failed to report leak" });
  }
};
