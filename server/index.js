const express= require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const { mongoUri, mongoDbName } = require("./config");

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(mongoUri);

// const dbName = "peerprep";
let questionsCollection;

async function connectDB() {
  await client.connect();
  const db = client.db(mongoDbName);
  questionsCollection = db.collection("Question");
  console.log("Connected to MongoDB");
}
// connectDB();

// Simple validation helper
function validateQuestionPayload(body) {
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

  // Example constraints (adjust to your project rubric)
  const allowedComplexity = ["Easy", "Medium", "Hard"];
  if (!complexity || typeof complexity !== "string" || !allowedComplexity.includes(complexity)) {
    return `complexity must be one of: ${allowedComplexity.join(", ")}`;
  }

  return null;
}

// API to get all questions
app.get("/api/questions", async (req, res) => {
  try {
    const questions = await questionsCollection.find().toArray();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// API to create a question (POST /api/question)
// need to make title, complexity, category unique
app.post("/api/question", async (req, res) => {
  try {
    if (!questionsCollection) {
      return res.status(503).json({ error: "Database not ready" });
    }

    const validationError = validateQuestionPayload(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { title, description, category, complexity } = req.body;

    // Optional: prevent exact duplicates (basic example)
    // (Better: create a unique index on title if that fits your requirements)
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

    // REST best practice: 201 + created resource (or at least id)
    res.status(201).json({
      _id: result.insertedId,
      ...newQuestion,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create question" });
  }
});

// Start server only after DB connects
(async () => {
  try {
    await connectDB();
    app.listen(5000, () => console.log("Server running on port 5000"));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();