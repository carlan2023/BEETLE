const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const customerSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never returned in queries by default
    },

    // ── Delivery Address ──────────────────────────────────────────
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "Kampala",
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [32.5811, 0.3163] }, // Kampala default
    },

    // ── Cart ──────────────────────────────────────────────────────
    cart: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vendor",
          required: true,
        },
        name: String,
        price: Number,
        image: String,
        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: 1,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ── Status ────────────────────────────────────────────────────
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // ── Metrics (denormalised for speed) ──────────────────────────
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },

    // ── Auth tokens ───────────────────────────────────────────────
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ───────────────────────────────────────────────────────
customerSchema.index({ email: 1 });
customerSchema.index({ location: "2dsphere" });

// ── Virtual: order count ───────────────────────────────────────────
customerSchema.virtual("orders", {
  ref: "Order",
  localField: "_id",
  foreignField: "customerId",
  count: true,
});

// ── Pre-save: hash password ────────────────────────────────────────
customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare password ──────────────────────────────
customerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: safe public profile ──────────────────────────
customerSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerificationToken;
  return obj;
};

// ── Instance method: get cart total ────────────────────────────────
customerSchema.methods.getCartTotal = function () {
  return this.cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
};

// ── Instance method: clear cart ────────────────────────────────────
customerSchema.methods.clearCart = function () {
  this.cart = [];
};

module.exports = mongoose.model("Customer", customerSchema);
