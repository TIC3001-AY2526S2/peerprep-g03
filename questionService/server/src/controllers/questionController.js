// handler functions
import Question from "../models/Question.js";
import { validateQuestionPayload } from "../utils/validators.js";

// get all questions
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
};

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
    const normalizedCategory = validationResult.normalizedCategory;

    const normalizedCategoryComplexityKey =
      `${complexity.trim().toLowerCase()}|${[...normalizedCategory].sort().join("|")}`;

    // Optional application-level check for friendlier error message
    const existingQuestion = await Question.findOne({
      categoryComplexityKey: normalizedCategoryComplexityKey
    });

    if (existingQuestion) {
      return res.status(409).json({
        error: "A question with the same category set and complexity already exists"
      });
    }

    const newQuestion = new Question({
      title: title.trim(),
      description: description.trim(),
      category: normalizedCategory,
      complexity
    });
    const savedQuestion = await newQuestion.save();

    res.status(201).json(savedQuestion);
  } catch (error) {
    console.error(error);

    // DB-level unique index protection fallback
    if (error.code === 11000 && error.keyPattern?.categoryComplexityKey) {
      return res.status(409).json({
        error: "A question with the same category set and complexity already exists"
      });
    }

    res.status(500).json({ error: "Failed to create question" });
  }
};

// update question by Mongo _id
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const validationResult = validateQuestionPayload(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json({
        error: validationResult.error,
        invalidCategories: validationResult.invalidCategories || []
      });
    }

    const { title, description, complexity } = req.body;
    const normalizedCategory = validationResult.normalizedCategory;
    const normalizedCategoryComplexityKey =
      `${complexity.trim().toLowerCase()}|${[...normalizedCategory].sort().join("|")}`;

    const existingQuestion = await Question.findOne({
      _id: { $ne: id },
      categoryComplexityKey: normalizedCategoryComplexityKey
    });

    if (existingQuestion) {
      return res.status(409).json({
        error: "A question with the same category set and complexity already exists"
      });
    }

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    question.title = title.trim();
    question.description = description.trim();
    question.category = normalizedCategory;
    question.complexity = complexity;

    const updatedQuestion = await question.save();

    return res.json(updatedQuestion);
  } catch (error) {
    console.error(error);

    if (error.code === 11000 && error.keyPattern?.categoryComplexityKey) {
      return res.status(409).json({
        error: "A question with the same category set and complexity already exists"
      });
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
      deletedQuestion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete question" });
  }
};