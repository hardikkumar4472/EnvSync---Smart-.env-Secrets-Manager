const User = require("../models/envsync_user.model");
const { signToken } = require("../config/jwt");
const { logAudit } = require("../utils/audit");

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // For Validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }

    // Validate role
    if (!['admin', 'developer'].includes(role)) {
      return res.status(400).json({ message: "Role must be either 'admin' or 'developer'" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Create new user
    const user = new User({
      email,
      password,
      role,
      isActive: true
    });

    await user.save();

    // Generate token
    const token = signToken({
      id: user._id,
      role: user.role,
    });

    // Log registration
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
    },
  });
};
