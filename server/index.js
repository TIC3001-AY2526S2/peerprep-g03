import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import Question from "./models/Question.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// API to get all questions
app.get("/api/questions", async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

app.listen(5000, () =>
  console.log("Server running on port 5000")
);