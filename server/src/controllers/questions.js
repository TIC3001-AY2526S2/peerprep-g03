// handler functions
const { getQuestionsCollection } = require("../db/mongo");

// Simple validation helper
function validateQuestionPayload(body) {
  if (!body || typeof body !== "object") return "Missing JSON body";

  const { title, description, category, complexity } = body;

  if (!title || typeof title !== "string" || title.trim().length < 3) {
    return "title is required (string, min 3 chars)";
  }
  if (!description || typeof description !== "string" || description.trim().length < 10) {
    return "description is required (string, min 10 chars)";
  }
  if (!category || typeof category !== "string") {
    return "category is required (string)";
  }

  const allowedComplexity = ["Easy", "Medium", "Hard"];
  if (!complexity || typeof complexity !== "string" || !allowedComplexity.includes(complexity)) {
    return `complexity must be one of: ${allowedComplexity.join(", ")}`;
  }

  return null;
}

async function getAllQuestions(req, res) {
  try {
    const questionsCollection = getQuestionsCollection();
    if (!questionsCollection) {
      return res.status(503).json({ error: "Database not ready" });
    }

    const questions = await questionsCollection.find().toArray();
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
}

async function createQuestion(req, res) {
  try {
    const questionsCollection = getQuestionsCollection();
    if (!questionsCollection) {
      return res.status(503).json({ error: "Database not ready" });
    }

    const validationError = validateQuestionPayload(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { title, description, category, complexity } = req.body;

    // Prevent duplicates based on same title - to be improved
    const existing = await questionsCollection.findOne({ title: title.trim() });
    if (existing) {
      return res.status(409).json({ error: "A question with this title already exists" });
    }

    const newQuestion = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      complexity,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await questionsCollection.insertOne(newQuestion);

    res.status(201).json({
      _id: result.insertedId,
      ...newQuestion,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create question" });
  }
}

module.exports = {
  getAllQuestions,
  createQuestion,
};