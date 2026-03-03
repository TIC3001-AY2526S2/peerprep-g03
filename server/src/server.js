// bootstraps DB + starts listening
require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./db/mongo");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();