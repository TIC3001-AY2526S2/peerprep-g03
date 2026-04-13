import cors from "cors";
import express from "express";
import matchingRoutes from "./routes/matching-routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/matching", matchingRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Hello World from matching-service" });
});

export default app;
