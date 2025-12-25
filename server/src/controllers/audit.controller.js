const AuditLog = require("../models/audit-log.model");

exports.listAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(1000)
      .select("-__v");

    res.json({
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};

