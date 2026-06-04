process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";

const request = require("supertest");
const app = require("../src/app");
const setup = require("./setup");
const Admin = require("../src/models/Admin");
const Vendor = require("../src/models/Vendor");
const Order = require("../src/models/Order");
const Product = require("../src/models/Product");

describe("Admin API - Core Tests", () => {
  let adminToken;
  let testId;

  beforeAll(async () => {
    await setup.connect();
    testId = Date.now();
  }, 30000);

  afterAll(async () => {
    await setup.close();
  }, 30000);

  beforeEach(async () => {
    await setup.clearDatabase();
  }, 30000);

  // ─── Admin Authentication Tests ────────────────────────────────
  describe("POST /api/admin/login", () => {
    it("should register and login an admin successfully", async () => {
      const admin = new Admin({
        email: "admin@beetle.com",
        password: "AdminSecure123",
        name: "Test Admin",
      });
      await admin.save();

      const response = await request(app)
        .post("/api/admin/login")
        .send({
          email: "admin@beetle.com",
          password: "AdminSecure123",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      adminToken = response.body.token;
    }, 30000);

    it("should reject login with invalid credentials", async () => {
      const admin = new Admin({
        email: `admin-${testId}@beetle.com`,
        password: "AdminSecure123",
        name: "Test Admin",
      });
      await admin.save();

      const response = await request(app)
        .post("/api/admin/login")
        .send({
          email: `admin-${testId}@beetle.com`,
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    }, 30000);
  });

  // ─── Analytics Tests ──────────────────────────────────
  describe("GET /api/admin/analytics", () => {
    it("should fetch analytics data successfully", async () => {
      const admin = new Admin({
        email: `admin-analytics-${testId}@beetle.com`,
        password: "AdminSecure123",
        name: "Test Admin",
      });
      await admin.save();

      const adminLogin = await request(app)
        .post("/api/admin/login")
        .send({
          email: `admin-analytics-${testId}@beetle.com`,
          password: "AdminSecure123",
        });

      adminToken = adminLogin.body.token;

      const response = await request(app)
        .get("/api/admin/analytics")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.vendorStats).toBeDefined();
    }, 30000);

    it("should require authentication", async () => {
      const response = await request(app)
        .get("/api/admin/analytics")
        .expect(401);

      expect(response.body.success).toBe(false);
    }, 30000);
  });

  describe("GET /api/admin/analytics/revenue", () => {
    it("should fetch revenue analytics", async () => {
      const admin = new Admin({
        email: `admin-revenue-${testId}@beetle.com`,
        password: "AdminSecure123",
        name: "Test Admin",
      });
      await admin.save();

      const adminLogin = await request(app)
        .post("/api/admin/login")
        .send({
          email: `admin-revenue-${testId}@beetle.com`,
          password: "AdminSecure123",
        });

      adminToken = adminLogin.body.token;

      const response = await request(app)
        .get("/api/admin/analytics/revenue?days=30")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    }, 30000);
  });

  // ─── Vendor Management Tests ────────────────────────────────────
  describe("GET /api/admin/vendors", () => {
    it("should fetch vendors", async () => {
      const admin = new Admin({
        email: `admin-vendors-${testId}@beetle.com`,
        password: "AdminSecure123",
        name: "Test Admin",
      });
      await admin.save();

      const adminLogin = await request(app)
        .post("/api/admin/login")
        .send({
          email: `admin-vendors-${testId}@beetle.com`,
          password: "AdminSecure123",
        });

      adminToken = adminLogin.body.token;

      const vendor = new Vendor({
        businessName: "Test Vendor",
        ownerName: "Vendor Owner",
        email: `vendor-${testId}@example.com`,
        phone: "0777123456",
        password: "VendorPass123",
        category: "groceries",
        address: "123 Test Street",
        status: "pending",
      });
      await vendor.save();

      const response = await request(app)
        .get("/api/admin/vendors")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    }, 30000);
  });

  describe("PATCH /api/admin/vendors/:id/approve", () => {
    it("should approve a vendor", async () => {
      const admin = new Admin({
        email: `admin-approve-${testId}@beetle.com`,
        password: "AdminSecure123",
        name: "Test Admin",
      });
      await admin.save();

      const adminLogin = await request(app)
        .post("/api/admin/login")
        .send({
          email: `admin-approve-${testId}@beetle.com`,
          password: "AdminSecure123",
        });

      adminToken = adminLogin.body.token;

      const vendor = new Vendor({
        businessName: "Test Vendor",
        ownerName: "Vendor Owner",
        email: `vendor-approve-${testId}@example.com`,
        phone: "0777123456",
        password: "VendorPass123",
        category: "groceries",
        address: "123 Test Street",
        status: "pending",
        isActive: false,
      });
      await vendor.save();

      const response = await request(app)
        .patch(`/api/admin/vendors/${vendor._id}/approve`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.vendor.status).toBe("approved");
      expect(response.body.vendor.isActive).toBe(true);
    }, 30000);
  });

  // ─── Order Management Tests ─────────────────────────────────────
  describe("GET /api/admin/orders/recent", () => {
    it("should fetch recent orders", async () => {
      const admin = new Admin({
        email: `admin-orders-${testId}@beetle.com`,
        password: "AdminSecure123",
        name: "Test Admin",
      });
      await admin.save();

      const adminLogin = await request(app)
        .post("/api/admin/login")
        .send({
          email: `admin-orders-${testId}@beetle.com`,
          password: "AdminSecure123",
        });

      adminToken = adminLogin.body.token;

      const vendor = new Vendor({
        businessName: "Test Vendor",
        ownerName: "Vendor Owner",
        email: `vendor-orders-${testId}@example.com`,
        phone: "0777123456",
        password: "VendorPass123",
        category: "groceries",
        address: "123 Test Street",
        status: "approved",
        isActive: true,
      });
      await vendor.save();

      const product = new Product({
        name: "Test Product",
        price: 25000,
        stock: 100,
        vendorId: vendor._id,
        category: "groceries",
      });
      await product.save();

      const order = new Order({
        vendorId: vendor._id,
        customer: {
          name: "John Doe",
          phone: "0700000001",
          address: "Test Address",
        },
        items: [
          {
            productId: product._id,
            name: product.name,
            price: 25000,
            quantity: 2,
          },
        ],
        subtotal: 50000,
        deliveryFee: 3000,
        serviceFee: 500,
        total: 53500,
        status: "DELIVERED",
        paymentStatus: "paid",
      });
      await order.save();

      const response = await request(app)
        .get("/api/admin/orders/recent?limit=10")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    }, 30000);
  });

  // ─── Export Tests ──────────────────────────────────────────────
  describe("GET /api/admin/vendors/export/csv", () => {
    it("should export vendors as CSV", async () => {
      const admin = new Admin({
        email: `admin-export-${testId}@beetle.com`,
        password: "AdminSecure123",
        name: "Test Admin",
      });
      await admin.save();

      const adminLogin = await request(app)
        .post("/api/admin/login")
        .send({
          email: `admin-export-${testId}@beetle.com`,
          password: "AdminSecure123",
        });

      adminToken = adminLogin.body.token;

      const vendor = new Vendor({
        businessName: "Test Vendor",
        ownerName: "Vendor Owner",
        email: `vendor-export-${testId}@example.com`,
        phone: "0777123456",
        password: "VendorPass123",
        category: "groceries",
        address: "123 Test Street",
        status: "approved",
        isActive: true,
      });
      await vendor.save();

      const response = await request(app)
        .get("/api/admin/vendors/export/csv")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.get("Content-Type")).toContain("text/csv");
      expect(response.get("Content-Disposition")).toContain("attachment");
    }, 30000);
  });
});
