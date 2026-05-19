const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vendorSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [100, 'Business name cannot exceed 100 characters'],
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned in queries by default
    },

    // ── Store details ─────────────────────────────────────────────
    category: {
      type: String,
      required: [true, 'Business category is required'],
      enum: ['groceries', 'electronics', 'clothing', 'footwear', 'food_drinks', 'home_living', 'pharmacy', 'other'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    logoUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },

    // ── Location ──────────────────────────────────────────────────
    address: {
      type: String,
      required: [true, 'Business address is required'],
    },
    city: {
      type: String,
      default: 'Kampala',
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [32.5811, 0.3163] }, // Kampala default
    },

    // ── Status & settings ─────────────────────────────────────────
    isActive: { type: Boolean, default: false },     // admin-approved
    isOpen: { type: Boolean, default: true },         // vendor-controlled
    isEmailVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended'],
      default: 'pending',
    },

    // ── Metrics (denormalised for speed) ─────────────────────────
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    // ── Auth tokens ───────────────────────────────────────────────
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
vendorSchema.index({ location: '2dsphere' });
vendorSchema.index({ email: 1 });
vendorSchema.index({ status: 1 });

// ── Virtual: product count ────────────────────────────────────────────────────
vendorSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'vendorId',
  count: true,
});

// ── Pre-save: hash password ───────────────────────────────────────────────────
vendorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: compare password ────────────────────────────────────────
vendorSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: safe public profile ─────────────────────────────────────
vendorSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerificationToken;
  return obj;
};

module.exports = mongoose.model('Vendor', vendorSchema);
