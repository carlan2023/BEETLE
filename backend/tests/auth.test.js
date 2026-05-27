process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";

const request = require("supertest");
const app = require("../src/app");
const setup = require("./setup");

const validVendor = {
  businessName: "Test Market",
  ownerName: "Jane Doe",
  email: "janedoe@example.com",
  phone: "0777123456",
  password: "strongpassword",
  category: "groceries",
  address: "123 Kampala Road",
  description: "A test vendor for Beetle.",
};

describe("Auth API - TDD tests", () => {
  beforeAll(async () => {
    await setup.connect();
  });

  afterAll(async () => {
    await setup.close();
  });

  beforeEach(async () => {
    await setup.clearDatabase();
  });

  it("should register a new vendor successfully", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(validVendor)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.vendor.email).toBe(validVendor.email);
    expect(response.body.vendor.password).toBeUndefined();
  });

  it("should reject registration when email already exists", async () => {
    await request(app).post("/api/auth/register").send(validVendor).expect(201);

    const response = await request(app)
      .post("/api/auth/register")
      .send({ ...validVendor, businessName: "Another Shop" })
      .expect(409);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/already exists/i);
  });

  it("should reject invalid registration payload", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "bad-email", password: "short" })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(Array.isArray(response.body.errors)).toBe(true);
  });
});

describe("Auth API - BDD flow", () => {
  beforeAll(async () => {
    await setup.connect();
  });

  afterAll(async () => {
    await setup.close();
  });

  beforeEach(async () => {
    await setup.clearDatabase();
  });

  it("Given a new vendor, when valid data is submitted, then the vendor can log in", async () => {
    await request(app).post("/api/auth/register").send(validVendor).expect(201);

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({ email: validVendor.email, password: validVendor.password })
      .expect(200);

    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.vendor.email).toBe(validVendor.email);
    expect(loginResponse.body.token).toBeDefined();
  });
});
