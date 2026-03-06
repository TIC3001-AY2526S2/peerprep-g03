import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import dns from "node:dns";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Question from "./models/Question.js";

dotenv.config();
dns.setServers(["8.8.8.8", "1.1.1.1"]);
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// API to get all questions
app.get("/api/questions", async (req, res) => {
  try {
    const questions = await Question.find().sort({ questionID: 1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// API to update one question by Mongo _id
app.put("/api/questions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid question id" });
    }

    const { questionID, title, description, category, complexity } = req.body;

    if (
      questionID === undefined ||
      !title?.trim() ||
      !description?.trim() ||
      !category?.trim() ||
      !complexity?.trim()
    ) {
      return res.status(400).json({
        error: "questionID, title, description, category, and complexity are required",
      });
    }

    const duplicateQuestionId = await Question.findOne({
      questionID: Number(questionID),
      _id: { $ne: id },
    });
    if (duplicateQuestionId) {
      return res.status(409).json({ error: "Duplicate Question ID" });
    }

    const duplicateTitle = await Question.findOne({
      title: { $regex: `^${escapeRegex(title.trim())}$`, $options: "i" },
      _id: { $ne: id },
    });
    if (duplicateTitle) {
      return res.status(409).json({ error: "Duplicate question title" });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        questionID: Number(questionID),
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        complexity: complexity.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    return res.json(updatedQuestion);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Duplicate Question ID" });
    }
    return res.status(500).json({ error: "Failed to update question" });
  }
});

app.listen(5000, () =>
  console.log("Server running on port 5000")
);
