const User = require("../models/envsync_user.model");
const { signToken } = require("../config/jwt");
const { logAudit } = require("../utils/audit");

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }
    if (role !== 'admin') {
      return res.status(403).json({ message: "Only admin accounts can be created through public registration. Developer accounts must be created by an administrator." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }
    const user = new User({
      email,
      password,
      role,
      isActive: true
    });
    await user.save();
    const token = signToken({
      id: user._id,
      role: user.role,
    });

    logAudit({
      user: { id: user._id, role: user.role },
      action: "REGISTER",
      ipAddress: req.ip,
    }).catch(() => {});

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

const { sendWelcomeEmail } = require("../utils/email");

exports.adminCreateUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }

    if (!['developer', 'viewer'].includes(role)) {
      return res.status(400).json({ message: "Admin can only create 'developer' or 'viewer' accounts." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const user = new User({
      email,
      password,
      role,
      isActive: true,
      createdBy: req.user.id
    });

    await user.save();
    const emailSent = await sendWelcomeEmail(email, password);

    res.status(201).json({
      message: "User created successfully" + (emailSent ? " and welcome email sent." : " but failed to send welcome email."),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin user creation error:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });
  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.isActive)
    return res.status(401).json({ message: "Invalid credentials" });
  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
  const token = signToken({
    id: user._id,
    role: user.role,
  });
  logAudit({
    user: { id: user._id, role: user.role },
    action: "LOGIN",
    ipAddress: req.ip,
  }).catch(() => {});
  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      assignedProjects: user.assignedProjects || [],
    },
  });
};
