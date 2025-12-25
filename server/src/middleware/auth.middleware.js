const { verifyToken } = require("../config/jwt");

module.exports = (req, res, next) => {
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
      req.user = decoded;
      next();
    } catch (err) {
      // Log error for debugging (but don't expose details to client)
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
