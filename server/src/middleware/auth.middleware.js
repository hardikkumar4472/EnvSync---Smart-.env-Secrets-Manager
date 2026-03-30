const { verifyToken } = require("../config/jwt");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }
    
    try {
      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) {
        return res.status(401).json({ message: "Invalid token payload" });
      }
      
      const User = require("../models/envsync_user.model");
      const user = await User.findById(decoded.id).select("-password");
      
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "User not found or inactive" });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error("Token verification error:", err.message);
      return res.status(401).json({ 
        message: err.message === "Token expired" ? "Token expired" : "Invalid token" 
      });
    }
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ message: "Authentication error" });
  }
};
