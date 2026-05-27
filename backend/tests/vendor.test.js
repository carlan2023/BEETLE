process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";

const request = require("supertest");
const app = require("../src/app");
const setup = require("./setup");

const vendorData = {
  businessName: "Beetle Shop",
  ownerName: "Alex Smith",
  email: "alexsmith@example.com",
  phone: "0777234567",
  password: "mypassword123",
  category: "food_drinks",
  address: "1 Kampala Avenue",
  description: "Vendor profile test",
};

describe("Vendor profile and protected routes", () => {
  beforeAll(async () => {
    await setup.connect();
  });

  afterAll(async () => {
    await setup.close();
  });

  beforeEach(async () => {
    await setup.clearDatabase();
  });

  it("should return vendor profile for authenticated vendor", async () => {
    const registration = await request(app).post("/api/auth/register").send(vendorData).expect(201);

    const token = registration.body.token;
    const profileResponse = await request(app)
      .get("/api/vendor/profile")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(profileResponse.body.success).toBe(true);
    expect(profileResponse.body.data.email).toBe(vendorData.email);
    expect(profileResponse.body.data.businessName).toBe(vendorData.businessName);
  });

  it("should allow vendor profile updates", async () => {
    const registration = await request(app).post("/api/auth/register").send(vendorData).expect(201);
    const token = registration.body.token;

    const updateResponse = await request(app)
      .put("/api/vendor/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ businessName: "Beetle Market", phone: "0777987654" })
      .expect(200);

    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.data.businessName).toBe("Beetle Market");
    expect(updateResponse.body.data.phone).toBe("0777987654");
  });
});
