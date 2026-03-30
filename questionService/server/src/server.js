// load env > connect DB > start Express server
import dotenv from "dotenv";
import dns from "node:dns";
import app from "./app.js";
import connectDB from "./config/db.js";
import syncQuestionIdCounter from "./config/initCounters.js";

dotenv.config();
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const PORT = process.env.PORT || 5050;

const startServer = async () => {
  try {
    await connectDB();
    await syncQuestionIdCounter();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();