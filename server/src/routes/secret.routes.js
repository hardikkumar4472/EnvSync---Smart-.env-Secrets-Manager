const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const rbac = require("../middleware/rbac.middleware");
const { 
  createSecret, 
  listSecrets, 
  getSecretValue,
  updateSecret,
  deleteSecret,
  bulkDeleteSecrets
} = require("../controllers/secret.controller");

/**
 * @route   POST /api/secrets
 * @desc    Create a new secret
 * @access  Admin only
 */
router.post("/", auth, rbac("admin"), createSecret);

/**
 * @route   GET /api/secrets
 * @desc    List secrets for a project/environment
 * @access  Admin only
 */
router.get("/", auth, rbac("admin"), listSecrets);

/**
 * @route   GET /api/secrets/:secretId/value
 * @desc    Get decrypted value of a secret
 * @access  Admin only
 */
router.get("/:secretId/value", auth, rbac("admin"), getSecretValue);

/**
 * @route   PUT /api/secrets/:secretId
 * @desc    Update a secret's key or value
 * @access  Admin only
 */
router.put("/:secretId", auth, rbac("admin"), updateSecret);

/**
 * @route   DELETE /api/secrets/:secretId
 * @desc    Delete a secret
 * @access  Admin only
 */
router.delete("/:secretId", auth, rbac("admin"), deleteSecret);

/**
 * @route   POST /api/secrets/bulk-delete
 * @desc    Bulk delete secrets by project and environment
 * @access  Admin only
 */
router.post("/bulk-delete", auth, rbac("admin"), bulkDeleteSecrets);

module.exports = router;
