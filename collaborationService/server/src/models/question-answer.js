import mongoose from "mongoose";

const questionAnswerSchema = new mongoose.Schema({
  matchId: {
    type: String,
    default: null,
  },
  questionId: {
    type: String,
    required: true,
    trim: true,
  },
  collabUser1Email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  collabUser2Email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  answer: {
    type: String,
    default: "",
  },
  submittedByEmail: {
    type: String,
    default: null,
    trim: true,
    lowercase: true,
  },
  submissionDate: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: "QuestionAnswer",
});

export default mongoose.model("QuestionAnswer", questionAnswerSchema);
