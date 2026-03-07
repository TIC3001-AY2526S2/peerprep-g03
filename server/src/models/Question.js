import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionId: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one topic is required"
      },
      trim: true,
    },
    complexity: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
      trim: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    modifiedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;
