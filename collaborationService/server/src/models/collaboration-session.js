import mongoose from "mongoose";

const collaborationSessionSchema = new mongoose.Schema({
  matchId: {
    type: String,
    default: null,
    index: true,
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
  pendingSubmissionAnswer: {
    type: String,
    default: "",
  },
  pendingSubmissionRequestedByEmail: {
    type: String,
    default: null,
    trim: true,
    lowercase: true,
  },
  pendingSubmissionRequestedAt: {
    type: Date,
    default: null,
  },
  lastSavedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: "CollaborationSession",
});

export default mongoose.model("CollaborationSession", collaborationSessionSchema);
