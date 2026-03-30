const Project = require("../models/project.model");
const Secret = require("../models/secret.model");
const { logAudit } = require("../utils/audit");

/**
 * Create a new project
 */
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }
    const exists = await Project.findOne({ name, createdBy: req.user.id });
    if (exists) {
      return res.status(409).json({ message: "Project already exists" });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
    });

    await logAudit({
      user: req.user,
      action: "PROJECT_CREATE",
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: "Project created",
      project,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Error creating project", error: error.message });
  }
};

/**
 * Get all projects
 */
exports.listProjects = async (req, res) => {
  try {
    const query = { isActive: true };
    if (req.user.role !== 'admin') {
      query.$or = [
        { createdBy: req.user.id },
        { _id: { $in: req.user.assignedProjects } }
      ];
    } else {
      query.createdBy = req.user.id;
    }

    const projects = await Project.find(
      query,
      { name: 1, description: 1, createdAt: 1, updatedAt: 1, _id: 1 }
    ).sort({ createdAt: -1 });

    res.json({
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Error listing projects:", error);
    res.status(500).json({ message: "Error fetching projects", error: error.message });
  }
};

/**
 * Get a single project by ID
 */
exports.getProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const query = { _id: projectId, isActive: true };
    if (req.user.role !== 'admin') {
      query.$or = [
        { createdBy: req.user.id },
        { _id: { $in: req.user.assignedProjects } }
      ];
    } else {
      query.createdBy = req.user.id;
    }

    const project = await Project.findOne(query);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const secretCount = await Secret.countDocuments({ projectId });

    res.json({
      project: {
        ...project.toObject(),
        secretCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching project", error: error.message });
  }
};

/**
 * Update a project
 */
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;

    if (!name && !description) {
      return res.status(400).json({ message: "At least one field (name or description) is required" });
    }

    const project = await Project.findOne({ 
      _id: projectId, 
      isActive: true, 
      createdBy: req.user.id 
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (name && name !== project.name) {
      const exists = await Project.findOne({ 
        name, 
        createdBy: req.user.id,
        _id: { $ne: projectId } 
      });
      if (exists) {
        return res.status(409).json({ message: "Project name already exists" });
      }
    }
    if (name) project.name = name;
    if (description !== undefined) project.description = description;

    await project.save();

    await logAudit({
      user: req.user,
      action: "PROJECT_UPDATE",
      projectId,
      ipAddress: req.ip,
    });

    res.json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating project", error: error.message });
  }
};

/**
 * Delete a project (soft delete)
 */
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOne({ 
      _id: projectId, 
      isActive: true, 
      createdBy: req.user.id 
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const secretCount = await Secret.countDocuments({ projectId });
    
    if (secretCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete project with ${secretCount} secret(s). Please delete all secrets first.`,
        secretCount 
      });
    }

    project.isActive = false;
    await project.save();

    await logAudit({
      user: req.user,
      action: "PROJECT_DELETE",
      projectId,
      ipAddress: req.ip,
    });

    res.json({
      message: "Project deleted successfully",
      projectId,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project", error: error.message });
  }
};

/**
 * Permanently delete a project and all its secrets
 */
exports.permanentlyDeleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { confirm } = req.body;

    if (confirm !== 'DELETE') {
      return res.status(400).json({ 
        message: "Please confirm deletion by sending { confirm: 'DELETE' }" 
      });
    }
    const project = await Project.findOne({ 
      _id: projectId, 
      createdBy: req.user.id 
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const secretDeleteResult = await Secret.deleteMany({ projectId });
    await Project.findByIdAndDelete(projectId);

    await logAudit({
      user: req.user,
      action: "PROJECT_PERMANENT_DELETE",
      projectId,
      metadata: { deletedSecrets: secretDeleteResult.deletedCount },
      ipAddress: req.ip,
    });

    res.json({
      message: "Project and all secrets permanently deleted",
      projectId,
      deletedSecrets: secretDeleteResult.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error permanently deleting project", error: error.message });
  }
};
