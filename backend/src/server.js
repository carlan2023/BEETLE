require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `\n?? Beetle API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`,
      );
      console.log(`   Health: http://localhost:${PORT}/api/health\n`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
