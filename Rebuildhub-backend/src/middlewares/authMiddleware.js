const jwt = require("jsonwebtoken");

// Main auth middleware: verifies JWT and attaches user
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Role-based helpers (require req.user to be set by authMiddleware)
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

const userOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "user") {
    return res.status(403).json({ message: "User access only" });
  }
  next();
};

// Export default auth middleware and attach helpers
module.exports = authMiddleware;
module.exports.adminOnly = adminOnly;
module.exports.userOnly = userOnly;
