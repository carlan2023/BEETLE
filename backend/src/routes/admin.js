const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const Admin = require("../models/Admin");
const Vendor = require("../models/Vendor");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
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

// ── GET /api/admin/analytics ──────────────────────────────────────────────
router.get("/analytics", protectAdmin, async (req, res) => {
  try {
    const [
      totalVendors,
      totalCustomers,
      totalOrders,
      totalProducts,
      pendingVendors,
      approvedVendors,
      suspendedVendors,
    ] = await Promise.all([
      Vendor.countDocuments(),
      Customer.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
      Vendor.countDocuments({ status: "pending" }),
      Vendor.countDocuments({ status: "approved" }),
      Vendor.countDocuments({ status: "suspended" }),
    ]);

    // Calculate total revenue
    const revenueData = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Get order status breakdown
    const orderStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Get revenue by status
    const revenueByStatus = await Order.aggregate([
      { $group: { _id: "$status", total: { $sum: "$amount" } } },
    ]);

    res.json({
      success: true,
      data: {
        totalVendors,
        totalCustomers,
        totalOrders,
        totalProducts,
        totalRevenue,
        vendorStats: {
          pending: pendingVendors,
          approved: approvedVendors,
          suspended: suspendedVendors,
        },
        orderStatus: orderStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        revenueByStatus: revenueByStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.total;
          return acc;
        }, {}),
      },
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch analytics" });
  }
});

// ── GET /api/admin/analytics/revenue ──────────────────────────────────────
router.get("/analytics/revenue", protectAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date();

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: { $gte: startDate, $lte: endDate },
      };
    } else {
      const calcStartDate = new Date();
      calcStartDate.setDate(calcStartDate.getDate() - days);
      dateFilter = {
        createdAt: { $gte: calcStartDate },
      };
    }

    const data = await Order.aggregate([
      {
        $match: dateFilter,
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    console.error("Revenue analytics error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch revenue analytics" });
  }
});

// ── GET /api/admin/analytics/top-vendors ──────────────────────────────────
router.get("/analytics/top-vendors", protectAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const data = await Vendor.find({ status: "approved" })
      .sort({ totalRevenue: -1 })
      .limit(limit)
      .select("businessName totalOrders totalRevenue rating reviewCount");

    res.json({ success: true, data });
  } catch (err) {
    console.error("Top vendors error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch top vendors" });
  }
});

// ── GET /api/admin/orders/recent ──────────────────────────────────────────
router.get("/orders/recent", protectAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("vendorId", "businessName")
      .populate("customerId", "firstName lastName")
      .select("_id vendorId customerId amount status createdAt");

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error("Recent orders error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch recent orders" });
  }
});

// GET /api/admin/vendors?status=pending
router.get("/vendors", protectAdmin, async (req, res) => {
  try {
    const status = req.query.status || "pending";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const vendors = await Vendor.find({ status })
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Vendor.countDocuments({ status });

    res.json({
      success: true,
      data: vendors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Admin vendors error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch vendors" });
  }
});

// ── GET /api/admin/vendors/search ─────────────────────────────────────────
router.get("/vendors/search", protectAdmin, async (req, res) => {
  try {
    const q = req.query.q || "";
    const status = req.query.status;

    let filter = {
      $or: [
        { businessName: { $regex: q, $options: "i" } },
        { ownerName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    };

    if (status) {
      filter.status = status;
    }

    const vendors = await Vendor.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: vendors });
  } catch (err) {
    console.error("Search vendors error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to search vendors" });
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

// ── GET /api/admin/vendors/export/csv ────────────────────────────────────
router.get("/vendors/export/csv", protectAdmin, async (req, res) => {
  try {
    const status = req.query.status;
    let filter = {};
    if (status) {
      filter.status = status;
    }

    const vendors = await Vendor.find(filter)
      .select(
        "businessName ownerName email phone category address status totalOrders totalRevenue rating createdAt",
      )
      .sort({ createdAt: -1 });

    // Build CSV
    const headers = [
      "Business Name",
      "Owner Name",
      "Email",
      "Phone",
      "Category",
      "Address",
      "Status",
      "Total Orders",
      "Total Revenue",
      "Rating",
      "Registered Date",
    ];

    const rows = vendors.map((v) => [
      `"${v.businessName}"`,
      `"${v.ownerName}"`,
      v.email,
      v.phone,
      v.category,
      `"${v.address}"`,
      v.status,
      v.totalOrders,
      v.totalRevenue,
      v.rating,
      new Date(v.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="vendors_${new Date().toISOString().split("T")[0]}.csv"`,
    );
    res.send(csv);
  } catch (err) {
    console.error("Export vendors error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to export vendors" });
  }
});

// ── GET /api/admin/orders/export/csv ─────────────────────────────────────
router.get("/orders/export/csv", protectAdmin, async (req, res) => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date();

    let filter = {};
    if (startDate) {
      filter.createdAt = { $gte: startDate, $lte: endDate };
    }

    const orders = await Order.find(filter)
      .populate("vendorId", "businessName")
      .populate("customerId", "firstName lastName email")
      .sort({ createdAt: -1 });

    const headers = [
      "Order ID",
      "Vendor",
      "Customer",
      "Email",
      "Amount",
      "Status",
      "Payment Status",
      "Delivery Address",
      "Order Date",
    ];

    const rows = orders.map((o) => [
      o._id.toString(),
      `"${o.vendorId?.businessName || "N/A"}"`,
      `"${o.customerId?.firstName} ${o.customerId?.lastName}"`,
      o.customerId?.email || "N/A",
      o.amount,
      o.status,
      o.paymentStatus,
      `"${o.deliveryAddress}"`,
      new Date(o.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="orders_${new Date().toISOString().split("T")[0]}.csv"`,
    );
    res.send(csv);
  } catch (err) {
    console.error("Export orders error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to export orders" });
  }
});
