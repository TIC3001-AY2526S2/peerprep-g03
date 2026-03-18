// create express app() > register middleware > mount routes
import express from "express";
import cors from "cors";
import questionRoutes from "./routes/questionRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Mount all API routes under /api
app.use("/api/questions", questionRoutes);

export default app;