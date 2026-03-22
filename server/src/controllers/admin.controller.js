const User = require("../models/envsync_user.model");
const Project = require("../models/project.model");
const { logAudit } = require("../utils/audit");

/**
 * List all users (excluding sensitive data)
 */
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({ createdBy: req.user.id }, { email: 1, role: 1, isActive: 1, assignedProjects: 1, createdAt: 1 })
      .populate("assignedProjects", "name");
    
    res.json({
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

/**
 * Assign a project to a user
 */
exports.assignProjectToUser = async (req, res) => {
  try {
    const { userId, projectId } = req.body;

    if (!userId || !projectId) {
      return res.status(400).json({ message: "User ID and Project ID are required" });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Add project to user's assignedProjects if not already present
    if (user.assignedProjects.includes(projectId)) {
      return res.status(400).json({ message: "Project already assigned to this user" });
    }

    user.assignedProjects.push(projectId);
    await user.save();

    await logAudit({
      user: req.user,
      action: "PROJECT_ASSIGN",
      projectId,
      ipAddress: req.ip,
    });

    res.json({
      message: "Project assigned successfully",
      user: {
        id: user._id,
        email: user.email,
        assignedProjects: user.assignedProjects,
      },
    });
  } catch (error) {
    console.error("Error assigning project:", error);
    res.status(500).json({ message: "Error assigning project" });
  }
};

/**
 * Unassign a project from a user
 */
exports.unassignProjectFromUser = async (req, res) => {
  try {
    const { userId, projectId } = req.body;

    if (!userId || !projectId) {
      return res.status(400).json({ message: "User ID and Project ID are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.assignedProjects = user.assignedProjects.filter(id => id.toString() !== projectId);
    await user.save();

    await logAudit({
      user: req.user,
      action: "PROJECT_UNASSIGN",
      projectId,
      ipAddress: req.ip,
    });

    res.json({
      message: "Project unassigned successfully",
      user: {
        id: user._id,
        email: user.email,
        assignedProjects: user.assignedProjects,
      },
    });
  } catch (error) {
    console.error("Error unassigning project:", error);
    res.status(500).json({ message: "Error unassigning project" });
  }
};

/**
 * Delete a user
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists and was created by this admin
    const user = await User.findOne({ _id: userId, createdBy: req.user.id });
    if (!user) {
      return res.status(404).json({ message: "User not found or you don't have permission to delete this user" });
    }

    // Role check - can't delete other admins if they're not self-created (already covered by createdBy)
    
    await User.findByIdAndDelete(userId);

    await logAudit({
      user: req.user,
      action: "USER_DELETE",
      metadata: { deletedUserEmail: user.email },
      ipAddress: req.ip,
    });

    res.json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};
