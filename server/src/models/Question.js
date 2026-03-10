import mongoose from "mongoose";
import Counter from "./Counter.js";
import { ReturnDocument } from "mongodb";

const questionSchema = new mongoose.Schema(
  {
    questionID: {
      type: Number,
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one topic is required"
      }
    },
    complexity: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"]
    }
  },
  {
    timestamps: true
  }
);

// Auto-increment questionID before first save
questionSchema.pre("save", async function () {
  if (!this.isNew || this.questionID != null) {
    return next();
  }

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "questionID" },
      { $inc: { seq: 1 } },
      { ReturnDocument: "after", upsert: true }
    );

    this.questionID = counter.seq;
  } catch (error) {
    console.log(error);
  }
});

const Question = mongoose.model("Question", questionSchema);

export default Question;