// Mongo connection + collection accessor
const { MongoClient } = require("mongodb");
const { mongoUri, mongoDbName } = require("../../config");

const client = new MongoClient(mongoUri);

let questionsCollection;

async function connectDB() {
  await client.connect();
  const db = client.db(mongoDbName);
  questionsCollection = db.collection("Question");
  console.log("Connected to MongoDB");
}

function getQuestionsCollection() {
  return questionsCollection;
}

module.exports = {
  connectDB,
  getQuestionsCollection,
};