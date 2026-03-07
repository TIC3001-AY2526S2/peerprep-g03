// handler functions
const { getQuestionsCollection } = require("../db/mongo");

// simple validation helper
function validateQuestionPayload(body) {
  if (!body || typeof body !== "object") return "Missing JSON body";

  const { title, description, topics, difficulty } = body;

  if (!title || typeof title !== "string" || title.trim().length < 3) {
    return "title is required (string, min 3 chars)";
  }
  if (!description || typeof description !== "string" || description.trim().length < 10) {
    return "description is required (string, min 10 chars)";
  }
  if (!Array.isArray(topics) || topics.length === 0) {
    return "topic(s) is/are required (non-empty array of strings)";
  }
  // ensure every element is a non-empty string
  const badTopic = topics.find(
    (c) => typeof c !== "string" || c.trim().length === 0
  );
  if (badTopic !== undefined) {
    return "each topic must be a non-empty string";
  }

  const difficultyLevels = ["Easy", "Medium", "Hard"];
  if (!difficulty || typeof difficulty !== "string" || !difficultyLevels.includes(difficulty)) {
    return `difficulty must be one of: ${difficultyLevels.join(", ")}`;
  }

  return null;
}

// get all questions
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

// create new question
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

    const { title, description, topics, difficulty } = req.body;

    // Prevent duplicates based on same title - to be improved
    const existing = await questionsCollection.findOne({ title: title.trim() });
    if (existing) {
      return res.status(409).json({ error: "A question with this title already exists" });
    }

    const topicsNormalised = [...new Set(topics.map(c => c.trim()))];
    const newQuestion = {
      title: title.trim(),
      description: description.trim(),
      topics: topicsNormalised,
      difficulty,
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