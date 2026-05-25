const express = require("express");
const router = express.Router();
const Vendor = require("../models/Vendor");
const Product = require("../models/Product");
const { body, validationResult } = require("express-validator");

// ── GET /api/public/restaurants ───────────────────────────────────────────────
// Browse restaurants (vendors with Food & Drinks category)
router.get("/restaurants", async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [vendors, total] = await Promise.all([
      Vendor.find({
        status: "approved",
        isActive: true,
        category: { $in: ["Food & Drinks", "Restaurants"] },
      })
        .select(
          "businessName description logoUrl coverUrl category address city rating reviewCount isOpen deliveryTimeMin deliveryTimeMax",
        )
        .sort({ rating: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Vendor.countDocuments({
        status: "approved",
        isActive: true,
        category: { $in: ["Food & Drinks", "Restaurants"] },
      }),
    ]);

    res.json({
      success: true,
      data: vendors,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch restaurants." });
  }
});

// ── GET /api/public/groceries ─────────────────────────────────────────────────
// Browse groceries (vendors with Groceries category)
router.get("/groceries", async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [vendors, total] = await Promise.all([
      Vendor.find({
        status: "approved",
        isActive: true,
        category: "Groceries",
      })
        .select(
          "businessName description logoUrl coverUrl category address city rating reviewCount isOpen deliveryTimeMin deliveryTimeMax",
        )
        .sort({ rating: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Vendor.countDocuments({
        status: "approved",
        isActive: true,
        category: "Groceries",
      }),
    ]);

    res.json({
      success: true,
      data: vendors,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch groceries." });
  }
});

// ── GET /api/public/categories ────────────────────────────────────────────────
// Get all product categories with vendor counts
router.get("/categories", async (req, res) => {
  try {
    const categoryList = [
      "Groceries",
      "Food & Drinks",
      "Footwear",
      "Clothing",
      "Electronics",
      "Home & Living",
      "Pharmacy",
      "Books",
    ];

    const categoryCounts = await Promise.all(
      categoryList.map(async (category) => ({
        label: category,
        count: await Vendor.countDocuments({
          status: "approved",
          isActive: true,
          category,
        }),
      })),
    );

    res.json({ success: true, data: categoryCounts });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories." });
  }
});

// ── GET /api/public/browse-vendors ────────────────────────────────────────────
// Browse all approved vendors (for vendors landing page)
router.get("/browse-vendors", async (req, res) => {
  try {
    const { page = 1, limit = 12, category } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const filter = { status: "approved", isActive: true };

    if (category) filter.category = category;

    const [vendors, total] = await Promise.all([
      Vendor.find(filter)
        .select(
          "businessName description logoUrl coverUrl category address city rating reviewCount isOpen deliveryTimeMin deliveryTimeMax",
        )
        .sort({ rating: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Vendor.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: vendors,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch vendors." });
  }
});

// ── POST /api/public/rider-signup ─────────────────────────────────────────────
// Allow potential riders to express interest
router.post(
  "/rider-signup",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").trim().notEmpty().withMessage("Phone number is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("experience").optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { fullName, email, phone, city, experience } = req.body;

      // In a real app, you'd save this to a Rider model or queue for review
      // For now, we'll just log it and return success
      console.log("🚴 New rider signup:", {
        fullName,
        email,
        phone,
        city,
        experience,
      });

      res.status(201).json({
        success: true,
        message: "Rider application received. Our team will contact you soon!",
      });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Failed to process rider signup." });
    }
  },
);

// ── GET /api/public/search ────────────────────────────────────────────────────
// Global search across vendors and products
router.get("/search", async (req, res) => {
  try {
    const { q, type = "all", limit = 10 } = req.query;

    if (!q) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required." });
    }

    const searchFilter = { $regex: q, $options: "i" };
    const vendorResults =
      type === "all" || type === "vendors"
        ? await Vendor.find({
            status: "approved",
            isActive: true,
            $or: [
              { businessName: searchFilter },
              { description: searchFilter },
            ],
          })
            .select("businessName description logoUrl category rating")
            .limit(Number(limit))
        : [];

    const productResults =
      type === "all" || type === "products"
        ? await Product.find({
            isAvailable: true,
            $or: [{ name: searchFilter }, { description: searchFilter }],
          })
            .select("name price thumbnail category")
            .limit(Number(limit))
        : [];

    res.json({
      success: true,
      data: {
        vendors: vendorResults,
        products: productResults,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Search failed." });
  }
});

module.exports = router;
