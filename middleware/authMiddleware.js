const jwt = require("jsonwebtoken");
const User = require("@models/User");

// ⚠️ If you don't really use blacklist table, comment it
// const BlacklistedToken = require("@models/BlacklistedToken");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: false,
        message: "Authorization header missing",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Invalid authorization format. Use Bearer TOKEN",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Token not provided",
      });
    }

    /* ================= VERIFY TOKEN ================= */

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* ================= USER CHECK ================= */

    const existingUser = await User.findByPk(decoded.id);

    if (!existingUser) {
      return res.status(401).json({
        status: false,
        message: "User no longer exists",
      });
    }

    req.user = decoded;
    next();

  } catch (error) {
    console.error("JWT ERROR:", error.message);

    return res.status(401).json({
      status: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;