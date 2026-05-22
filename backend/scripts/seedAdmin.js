require("dotenv").config();
const connectDB = require("../src/config/db");
const Admin = require("../src/models/Admin");

const run = async () => {
  await connectDB();
  const email = process.env.ADMIN_EMAIL || "admin@beetle.local";
  const pass = process.env.ADMIN_PASSWORD || "password123";
  const exists = await Admin.findOne({ email });
  if (exists) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }
  const admin = new Admin({ email, password: pass, name: "Site Admin" });
  await admin.save();
  console.log("Created admin:", email, "password:", pass);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
