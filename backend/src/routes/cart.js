const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { protectCustomer } = require("../middleware/auth");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Order = require("../models/Order");

// ── GET /api/cart ─────────────────────────────────────────────────────────
router.get("/", protectCustomer, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id).populate({
      path: "cart.productId",
      select: "name price image",
    });

    const cart = customer.cart.map((item) => ({
      _id: item._id,
      productId: item.productId._id,
      vendorId: item.vendorId,
      name: item.name || item.productId.name,
      price: item.price || item.productId.price,
      image: item.image || item.productId.image,
      quantity: item.quantity,
      addedAt: item.addedAt,
    }));

    const total = customer.getCartTotal();

    res.json({
      success: true,
      cart,
      total,
      itemCount: cart.length,
    });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch cart." });
  }
});

// ── POST /api/cart/add ────────────────────────────────────────────────────
router.post(
  "/add",
  protectCustomer,
  [
    body("productId").notEmpty().withMessage("Product ID is required"),
    body("vendorId").notEmpty().withMessage("Vendor ID is required"),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { productId, vendorId, quantity = 1 } = req.body;

      // Verify product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found." });
      }

      // Check if product already in cart
      const customer = await Customer.findById(req.customer._id);
      const existingItem = customer.cart.find(
        (item) => item.productId.toString() === productId,
      );

      if (existingItem) {
        // Update quantity
        existingItem.quantity += quantity;
      } else {
        // Add new item
        customer.cart.push({
          productId,
          vendorId,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        });
      }

      await customer.save();

      res.json({
        success: true,
        message: "Item added to cart.",
        cartCount: customer.cart.length,
      });
    } catch (err) {
      console.error("Add to cart error:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to add item to cart." });
    }
  },
);

// ── POST /api/cart/remove ─────────────────────────────────────────────────
router.post(
  "/remove",
  protectCustomer,
  [body("productId").notEmpty().withMessage("Product ID is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { productId } = req.body;

      const customer = await Customer.findById(req.customer._id);
      customer.cart = customer.cart.filter(
        (item) => item.productId.toString() !== productId,
      );

      await customer.save();

      res.json({
        success: true,
        message: "Item removed from cart.",
        cartCount: customer.cart.length,
      });
    } catch (err) {
      console.error("Remove from cart error:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to remove item from cart." });
    }
  },
);

// ── POST /api/cart/update ─────────────────────────────────────────────────
router.post(
  "/update",
  protectCustomer,
  [
    body("productId").notEmpty().withMessage("Product ID is required"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { productId, quantity } = req.body;

      const customer = await Customer.findById(req.customer._id);
      const item = customer.cart.find(
        (i) => i.productId.toString() === productId,
      );

      if (!item) {
        return res
          .status(404)
          .json({ success: false, message: "Item not in cart." });
      }

      item.quantity = quantity;
      await customer.save();

      const total = customer.getCartTotal();

      res.json({
        success: true,
        message: "Cart item updated.",
        quantity,
        total,
      });
    } catch (err) {
      console.error("Update cart error:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to update cart item." });
    }
  },
);

// ── POST /api/cart/clear ──────────────────────────────────────────────────
router.post("/clear", protectCustomer, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id);
    customer.clearCart();
    await customer.save();

    res.json({
      success: true,
      message: "Cart cleared.",
    });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ success: false, message: "Failed to clear cart." });
  }
});

// ── POST /api/cart/checkout ───────────────────────────────────────────────
router.post(
  "/checkout",
  protectCustomer,
  [
    body("address")
      .trim()
      .notEmpty()
      .withMessage("Delivery address is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { address } = req.body;
      const customer = await Customer.findById(req.customer._id);

      if (customer.cart.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Cart is empty." });
      }

      // Group items by vendor
      const ordersByVendor = {};
      customer.cart.forEach((item) => {
        const vendorId = item.vendorId.toString();
        if (!ordersByVendor[vendorId]) {
          ordersByVendor[vendorId] = [];
        }
        ordersByVendor[vendorId].push({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        });
      });

      // Create orders for each vendor
      const orders = [];
      let totalAmount = 0;

      for (const vendorId in ordersByVendor) {
        const items = ordersByVendor[vendorId];
        const amount = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        totalAmount += amount;

        const order = await Order.create({
          customerId: customer._id,
          vendorId,
          items,
          amount,
          deliveryAddress: address,
          status: "pending",
          paymentStatus: "pending",
        });

        orders.push(order);

        // Update vendor order count and revenue
        const Vendor = require("../models/Vendor");
        await Vendor.findByIdAndUpdate(vendorId, {
          $inc: { totalOrders: 1, totalRevenue: amount },
        });
      }

      // Update customer metrics
      customer.totalOrders += orders.length;
      customer.totalSpent += totalAmount;
      customer.address = address;
      customer.clearCart();
      await customer.save();

      console.log("✅ Checkout successful:", {
        customerId: customer._id,
        orderCount: orders.length,
        totalAmount,
      });

      res.status(201).json({
        success: true,
        message: "Orders created successfully.",
        orders: orders.map((o) => ({
          _id: o._id,
          vendorId: o.vendorId,
          amount: o.amount,
          status: o.status,
        })),
        totalAmount,
      });
    } catch (err) {
      console.error("Checkout error:", err);
      res
        .status(500)
        .json({
          success: false,
          message: "Checkout failed. Please try again.",
        });
    }
  },
);

module.exports = router;
