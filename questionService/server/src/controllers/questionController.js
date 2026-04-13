// handler functions
// const { getQuestionsCollection } = require("../db/mongo");
import Question from "../models/Question.js";
import { validateQuestionPayload, validateCategory } from "../utils/validators.js";

// get all questions
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: "Failed to fetch questions" });

  }
}

// create new question
export const createQuestion = async (req, res) => {
  try {
    const validationResult = validateQuestionPayload(req.body);

    if (!validationResult.isValid) {
      return res.status(400).json({
        error: validationResult.error,
        invalidCategories: validationResult.invalidCategories || []
      });
    }
    
    const { title, description, complexity } = req.body;
    const normalizedCategories = validationResult.normalizedCategories;
    const normalizedTitle = title.trim().toLowerCase();
    const normalizedComplexity = complexity.trim().toLowerCase();

    const uniqueQuestionKey =
      `${normalizedTitle}|${normalizedComplexity}|${normalizedCategories.join("|")}`;
    
    // Optional application-level check for friendlier error message
    const existingQuestion = await Question.findOne({ uniqueQuestionKey });

    if (existingQuestion) {
      console.log("hits here- found existing question");
      return res.status(409).json({
        error: "A question with the same title, category set and complexity already exists"
      });
    }

    const newQuestion = new Question({
      title: title.trim(),
      description: description.trim(),
      category: normalizedCategories,
      complexity
    });

    const savedQuestion = await newQuestion.save();

    return res.status(201).json(savedQuestion);
  } catch (error) {
    console.error(error);

    // DB-level unique index protection fallback
    if (error.code === 11000 && error.keyPattern?.uniqueQuestionKey) {
      return res.status(409).json({
        error: "A question with the same title, category set and complexity already exists"
      });
    }

    return res.status(500).json({ error: "Failed to create question" });
  }
};

// update question by Mongo _id
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionID, title, description, category, complexity } = req.body;

    const nextQuestionId = questionID;
    const titleText = String(title ?? "").trim();
    const descriptionText = String(description ?? "").trim();
    const complexityText = String(complexity ?? "").trim();
    const categoryList = Array.isArray(category)
      ? category.map((c) => String(c).trim()).filter(Boolean)
      : [String(category ?? "").trim()].filter(Boolean);

    if (
      nextQuestionId === undefined ||
      Number.isNaN(Number(nextQuestionId)) ||
      !titleText ||
      !descriptionText ||
      categoryList.length === 0 ||
      !complexityText
    ) {
      return res.status(400).json({
        error: "questionID, title, description, category, and complexity are required",
      });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      {
        questionID: Number(nextQuestionId),
        title: titleText,
        description: descriptionText,
        category: categoryList,
        complexity: complexityText,
      },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    return res.json(updatedQuestion);
  } catch (error) {
    console.error(error);
    // 11000 is MongoDB’s duplicate key error code.
    if (error.code === 11000) {
      return res.status(409).json({ error: "Duplicate questionID" });
    }
    return res.status(500).json({ error: "Failed to update question" });
  }
};

//delete question
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json({
      message: "Question deleted successfully",
      deletedQuestion,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete question" });
  }
};