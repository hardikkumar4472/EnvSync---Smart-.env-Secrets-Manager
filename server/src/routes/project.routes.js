const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const rbac = require("../middleware/rbac.middleware");
const {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  permanentlyDeleteProject,
} = require("../controllers/project.controller");

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Admin only
 */
router.post("/", auth, rbac("admin"), createProject);

/**
 * @route   GET /api/projects
 * @desc    Get all projects
 * @access  Admin, Developer
 */
router.get("/", auth, rbac("admin", "developer"), listProjects);

/**
 * @route   GET /api/projects/:projectId
 * @desc    Get a single project by ID
 * @access  Admin, Developer
 */
router.get("/:projectId", auth, rbac("admin", "developer"), getProject);

/**
 * @route   PUT /api/projects/:projectId
 * @desc    Update a project
 * @access  Admin only
 */
router.put("/:projectId", auth, rbac("admin"), updateProject);

/**
 * @route   DELETE /api/projects/:projectId
 * @desc    Soft delete a project (only if no secrets exist)
 * @access  Admin only
 */
router.delete("/:projectId", auth, rbac("admin"), deleteProject);

/**
 * @route   DELETE /api/projects/:projectId/permanent
 * @desc    Permanently delete a project and all its secrets
 * @access  Admin only
 */
router.delete("/:projectId/permanent", auth, rbac("admin"), permanentlyDeleteProject);

module.exports = router;
