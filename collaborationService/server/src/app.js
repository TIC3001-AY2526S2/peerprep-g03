import express from "express";
import cors from "cors";
import collaborationRoutes from "./routes/collaboration-routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ message: "Collaboration service is running." });
});

app.use("/api/collaboration", collaborationRoutes);

export default app;
