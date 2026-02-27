
// For simplicity, assume req.user is populated via JWT elsewhere
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

module.exports = { adminOnly, userOnly };



/*
//for testing purposes only
/// For simplicity, assume req.user is populated via JWT elsewhere
const adminOnly = (req, res, next) => {
  // TEMPORARY TESTING ONLY
  req.user = { role: "admin" };
  next();
};

module.exports = { adminOnly };

const userOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "user") {
    return res.status(403).json({ message: "User access only" });
  }
  next();
};

module.exports = { adminOnly, userOnly };
*/
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
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
