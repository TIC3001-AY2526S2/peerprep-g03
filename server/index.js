const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const express= require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "peerprep";
let questionsCollection;

async function connectDB() {
  await client.connect();
  const db = client.db(dbName);
  questionsCollection = db.collection("Question");
  console.log("Connected to MongoDB Atlas");
}
connectDB();

app.get("/api/questions", async (req, res) => {
  try {
    const questions = await questionsCollection.find().toArray();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));

