const { addAuditJob } = require("../queues/auditQueue");

exports.logAudit = async (data) => {
  try {
    // Non-blocking background job
    await addAuditJob(data);
  } catch (err) {
    console.error("Failed to queue audit log:", err.message);
  }
};
