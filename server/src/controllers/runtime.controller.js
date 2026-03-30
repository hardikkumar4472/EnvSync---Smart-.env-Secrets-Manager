const Secret = require("../models/secret.model");
const Project = require("../models/project.model");
const { decrypt } = require("../utils/encryption");
const { logAudit } = require("../utils/audit");

/**
 * Runtime-only secret fetch
 * Secrets decrypted ONLY in memory
 */
exports.getRuntimeSecrets = async (req, res) => {
  try {
    const { projectId, environment } = req.body;

    if (!projectId || !environment) {
      return res
        .status(400)
        .json({ message: "projectId and environment are required" });
    }
    const project = await Project.findOne({ 
      _id: projectId, 
      isActive: true,
      $or: [
        { createdBy: req.user.id },
        { _id: { $in: req.user.assignedProjects || [] } }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found or access denied" });
    }

    const secrets = await Secret.find({ projectId, environment });

    if (!secrets.length) {
      return res.json({});
    }

    const runtimeSecrets = {};

    for (const secret of secrets) {
      runtimeSecrets[secret.key] = decrypt(secret.encryptedValue);
    }

    await logAudit({
      user: req.user,
      action: "RUNTIME_SECRET_ACCESS",
      projectId,
      environment,
      ipAddress: req.ip,
    });
    
    res.json(runtimeSecrets);
  } catch (error) {
    console.error("Error fetching runtime secrets:", error);
    res.status(500).json({ message: "Error fetching runtime secrets", error: error.message });
  }
};
