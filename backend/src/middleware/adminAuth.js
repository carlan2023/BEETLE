const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protectAdmin = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer "))
      token = req.headers.authorization.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin)
      return res
        .status(401)
        .json({ success: false, message: "Admin not found" });
    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError")
      return res.status(401).json({ success: false, message: "Invalid token" });
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ success: false, message: "Token expired" });
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { protectAdmin };
