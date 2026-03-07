// handler functions
// const { getQuestionsCollection } = require("../db/mongo");
import Question from "../models/Question.js";

// simple validation helper
const validateQuestionPayload = (body) => {
  const { questionId, title, description, category, complexity } = body;

  if (!body || typeof body !== "object") return "Missing JSON body";

  if (typeof questionId !== "number") {
    return "questionId is required and must be a number";
  }
  if (!title || typeof title !== "string" || title.trim().length < 3) {
    return "title is required (string, min 3 chars)";
  }
  if (!description || typeof description !== "string" || description.trim().length < 10) {
    return "description is required (string, min 10 chars)";
  }
  if (!Array.isArray(category) || category.length === 0) {
    return "category is required (non-empty array of strings)";
  }
  // ensure every element is a non-empty string
  const badTopic = category.find(
    (c) => typeof c !== "string" || c.trim().length === 0
  );
  if (badTopic !== undefined) {
    return "each category must be a non-empty string";
  }

  const complexityLevels = ["Easy", "Medium", "Hard"];
  if (!complexity || typeof complexity !== "string" || !complexityLevels.includes(complexity)) {
    return `complexity must be one of: ${complexityLevels.join(", ")}`;
  }

  return null;
}

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
    // const questionsCollection = getQuestionsCollection();
    // if (!questionsCollection) {
    //   return res.status(503).json({ error: "Database not ready" });
    // }

    const validationError = validateQuestionPayload(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { questionId, title, description, category, complexity } = req.body;

    // Prevent duplicates based on same title - to be improved
    const existing = await Question.findOne({ 
      $or: [
        { questionId },
        { title: title.trim() }
      ]
    });
      
    if (existing) {
      return res.status(409).json({ error: "A question with same questionId or title already exists" });
    }

    const categoryNormalised = [...new Set(category.map(c => c.trim()))];
    const newQuestion = await Question.create({
      questionId,
      title: title.trim(),
      description: description.trim(),
      category: categoryNormalised,
      complexity,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json(newQuestion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create question" });
  }
};