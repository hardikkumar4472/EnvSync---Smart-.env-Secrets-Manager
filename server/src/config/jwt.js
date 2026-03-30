const jwt = require("jsonwebtoken");
if (!process.env.JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is not set in environment variables!");
  throw new Error("JWT_SECRET is required but not configured");
}
exports.signToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

exports.verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    } else if (error.name === "TokenExpiredError") {
      throw new Error("Token expired");
    } else {
      throw error;
    }
  }
};
