
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
