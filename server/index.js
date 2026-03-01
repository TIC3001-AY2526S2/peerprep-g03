const express= require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb://MongoDBAdm:Password123@localhost:27017/?authSource=admin";
const client = new MongoClient(uri);
const dbName = "peerprep";
let questionsCollection;

async function connectDB() {
  await client.connect();
  const db = client.db(dbName);
  questionsCollection = db.collection("Question");
  console.log("Connected to MongoDB");
}
connectDB();
async function connectDB() {
  await client.connect();
  const db = client.db(dbName);
  questionsCollection = db.collection("Question");
  console.log("Connected to MongoDB");
}
connectDB();

// API to get all questions
app.get("/api/questions", async (req, res) => {
  try {
    const questions = await questionsCollection.find().toArray();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
