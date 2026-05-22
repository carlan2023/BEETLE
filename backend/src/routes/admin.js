const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const Admin = require("../models/Admin");
const Vendor = require("../models/Vendor");
const { protectAdmin } = require("../middleware/adminAuth");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// POST /api/admin/login
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const { email, password } = req.body;
      const admin = await Admin.findOne({ email }).select("+password");
      if (!admin)
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      const ok = await admin.comparePassword(password);
      if (!ok)
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      const token = signToken(admin._id);
      res.json({ success: true, token, admin: admin.toJSON() });
    } catch (err) {
      console.error("Admin login error:", err);
      res.status(500).json({ success: false, message: "Login failed" });
    }
  },
);

// GET /api/admin/vendors?status=pending
router.get("/vendors", protectAdmin, async (req, res) => {
  try {
    const status = req.query.status || "pending";
    const vendors = await Vendor.find({ status })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ success: true, data: vendors });
  } catch (err) {
    console.error("Admin vendors error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch vendors" });
  }
});

// PATCH /api/admin/vendors/:id/approve
router.patch("/vendors/:id/approve", protectAdmin, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor)
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    vendor.status = "approved";
    vendor.isActive = true;
    await vendor.save();
    res.json({ success: true, vendor: vendor.toPublicJSON() });
  } catch (err) {
    console.error("Approve vendor error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to approve vendor" });
  }
});

// PATCH /api/admin/vendors/:id/suspend
router.patch("/vendors/:id/suspend", protectAdmin, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor)
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    vendor.status = "suspended";
    vendor.isActive = false;
    await vendor.save();
    res.json({ success: true, vendor: vendor.toPublicJSON() });
  } catch (err) {
    console.error("Suspend vendor error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to suspend vendor" });
  }
});

module.exports = router;
