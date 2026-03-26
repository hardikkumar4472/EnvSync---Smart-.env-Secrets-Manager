const AuditLog = require("../models/audit-log.model");

exports.logAudit = async ({
  user,
  action,
  projectId,
  environment,
  ipAddress,
  details,
}) => {
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
    console.error("Audit log failed:", err.message);
  }
};
