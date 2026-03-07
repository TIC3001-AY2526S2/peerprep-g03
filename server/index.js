import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import dns from "node:dns";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Question from "./models/Question.js";

import questionRoutes from "./routes/questionRoutes.js";


dotenv.config();
dns.setServers(["8.8.8.8", "1.1.1.1"]);
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/questions", questionRoutes)

app.listen(5000, () =>
  console.log("Server running on port 5000")
);