const Secret = require("../models/secret.model");
const Project = require("../models/project.model");
const { decrypt } = require("../utils/encryption");
const { logAudit } = require("../utils/audit");

/**
 * Runtime-only secret fetch
 * ⚠️ Secrets decrypted ONLY in memory
 */
exports.getRuntimeSecrets = async (req, res) => {
  const { projectId, environment } = req.body;

  if (!projectId || !environment) {
    return res
      .status(400)
      .json({ message: "projectId and environment are required" });
  }

  // Verify project belongs to the current user
  const project = await Project.findOne({ 
    _id: projectId, 
    isActive: true, 
    createdBy: req.user.id 
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found or access denied" });
  }

  const secrets = await Secret.find({ projectId, environment });

  if (!secrets.length) {
    return res.json({});
  }

  // 🔓 Decrypt ONLY in RAM
  const runtimeSecrets = {};

  for (const secret of secrets) {
    runtimeSecrets[secret.key] = decrypt(secret.encryptedValue);
  }

  /**
   * ⚠️ VERY IMPORTANT:
   * Do NOT log runtimeSecrets
   * Do NOT store runtimeSecrets
   */

  await logAudit({
  user: req.user,
  action: "RUNTIME_SECRET_ACCESS",
  projectId,
  environment,
  ipAddress: req.ip,
});
  res.json(runtimeSecrets);


  // After response → variables go out of scope → GC clears memory
};
