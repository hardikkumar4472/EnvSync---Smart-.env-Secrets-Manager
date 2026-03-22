const Secret = require("../models/secret.model");
const Project = require("../models/project.model");
const { encrypt, decrypt } = require("../utils/encryption");
const { logAudit } = require("../utils/audit");

/**
 * Create a new secret
 */
exports.createSecret = async (req, res) => {
  try {
    const { projectId, environment, key, value } = req.body;

    if (!projectId || !environment || !key || !value) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Verify project access
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

    // Check if secret with same key already exists for this project/environment
    const exists = await Secret.findOne({ projectId, environment, key });
    if (exists) {
      return res.status(409).json({ 
        message: "Secret with this key already exists for this project and environment" 
      });
    }

    const encrypted = encrypt(value);
    const secret = await Secret.create({
      projectId,
      environment,
      key,
      encryptedValue: encrypted,
      createdBy: req.user.id,
    });

    await logAudit({
      user: req.user,
      action: "SECRET_CREATE",
      projectId,
      environment,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: "Secret stored securely",
      secretId: secret._id,
    });
  } catch (error) {
    console.error("Error creating secret:", error);
    res.status(500).json({ message: "Error creating secret", error: error.message });
  }
};

/**
 * List all secrets for a project/environment
 */
exports.listSecrets = async (req, res) => {
  try {
    const { projectId, environment } = req.query;

    if (!projectId || !environment) {
      return res
        .status(400)
        .json({ message: "projectId and environment are required" });
    }

    // Verify project access
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

    const secrets = await Secret.find(
      { projectId, environment },
      {
        key: 1,
        environment: 1,
        projectId: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    ).sort({ createdAt: -1 });

    res.json({
      count: secrets.length,
      secrets,
    });
  } catch (error) {
    console.error("Error listing secrets:", error);
    res.status(500).json({ message: "Error fetching secrets", error: error.message });
  }
};

/**
 * Get decrypted value of a specific secret
 */
exports.getSecretValue = async (req, res) => {
  const { secretId } = req.params;

  if (!secretId) {
    return res.status(400).json({ message: "secretId is required" });
  }

  const secret = await Secret.findById(secretId);

  if (!secret) {
    return res.status(404).json({ message: "Secret not found" });
  }

  // Verify project access
  const project = await Project.findOne({ 
    _id: secret.projectId, 
    isActive: true,
    $or: [
      { createdBy: req.user.id },
      { _id: { $in: req.user.assignedProjects || [] } }
    ]
  });

  if (!project) {
    return res.status(404).json({ message: "Secret not found or access denied" });
  }

  const decryptedValue = decrypt(secret.encryptedValue);

  await logAudit({
    user: req.user,
    action: "SECRET_VIEW",
    projectId: secret.projectId,
    environment: secret.environment,
    metadata: { secretKey: secret.key },
    ipAddress: req.ip,
  });

  res.json({
    key: secret.key,
    value: decryptedValue,
    environment: secret.environment,
    projectId: secret.projectId,
    createdAt: secret.createdAt,
    updatedAt: secret.updatedAt,
  });
};

/**
 * Update a secret's value
 */
exports.updateSecret = async (req, res) => {
  try {
    const { secretId } = req.params;
    const { value, key } = req.body;

    if (!value && !key) {
      return res.status(400).json({ message: "At least one field (key or value) is required" });
    }

    const secret = await Secret.findById(secretId);

    if (!secret) {
      return res.status(404).json({ message: "Secret not found" });
    }

    // Verify project access
    const project = await Project.findOne({ 
      _id: secret.projectId, 
      isActive: true,
      $or: [
        { createdBy: req.user.id },
        { _id: { $in: req.user.assignedProjects || [] } }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: "Secret not found or access denied" });
    }

    // If updating key, check if new key already exists
    if (key && key !== secret.key) {
      const exists = await Secret.findOne({ 
        projectId: secret.projectId, 
        environment: secret.environment, 
        key,
        _id: { $ne: secretId }
      });
      
      if (exists) {
        return res.status(409).json({ 
          message: "Secret with this key already exists for this project and environment" 
        });
      }
      
      secret.key = key;
    }

    // If updating value, encrypt it
    if (value) {
      secret.encryptedValue = encrypt(value);
    }

    await secret.save();

    await logAudit({
      user: req.user,
      action: "SECRET_UPDATE",
      projectId: secret.projectId,
      environment: secret.environment,
      metadata: { secretKey: secret.key },
      ipAddress: req.ip,
    });

    res.json({
      message: "Secret updated successfully",
      secretId: secret._id,
      key: secret.key,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating secret", error: error.message });
  }
};

/**
 * Delete a secret
 */
exports.deleteSecret = async (req, res) => {
  try {
    const { secretId } = req.params;

    const secret = await Secret.findById(secretId);

    if (!secret) {
      return res.status(404).json({ message: "Secret not found" });
    }

    // Verify project access
    const project = await Project.findOne({ 
      _id: secret.projectId, 
      isActive: true,
      $or: [
        { createdBy: req.user.id },
        { _id: { $in: req.user.assignedProjects || [] } }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: "Secret not found or access denied" });
    }

    const { projectId, environment, key } = secret;

    await Secret.findByIdAndDelete(secretId);

    await logAudit({
      user: req.user,
      action: "SECRET_DELETE",
      projectId,
      environment,
      metadata: { secretKey: key },
      ipAddress: req.ip,
    });

    res.json({
      message: "Secret deleted successfully",
      secretId,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting secret", error: error.message });
  }
};

/**
 * Bulk delete secrets by project and environment
 */
exports.bulkDeleteSecrets = async (req, res) => {
  try {
    const { projectId, environment, confirm } = req.body;

    if (!projectId || !environment) {
      return res.status(400).json({ message: "projectId and environment are required" });
    }

    if (confirm !== 'DELETE') {
      return res.status(400).json({ 
        message: "Please confirm deletion by sending { confirm: 'DELETE' }" 
      });
    }

    // Verify project access
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

    const result = await Secret.deleteMany({ projectId, environment });

    await logAudit({
      user: req.user,
      action: "SECRET_BULK_DELETE",
      projectId,
      environment,
      metadata: { deletedCount: result.deletedCount },
      ipAddress: req.ip,
    });

    res.json({
      message: `Successfully deleted ${result.deletedCount} secret(s)`,
      deletedCount: result.deletedCount,
      projectId,
      environment,
    });
  } catch (error) {
    res.status(500).json({ message: "Error bulk deleting secrets", error: error.message });
  }
};
