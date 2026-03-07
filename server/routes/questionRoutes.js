import express from "express";
import Question from "../src/models/Question.js";
const router = express.Router();
// GET all questions

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

router.get("/", async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// API to update one question by Mongo _id
router.put("/:id", async (req, res) => {
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

// API to delete question id
router.delete("/:id", async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "Question deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete question" });
  }
});


export default router;
