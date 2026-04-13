import mongoose from "mongoose";
import Counter from "./Counter.js";
import { MAX_CATEGORY_COUNT } from "../constants/categories.js";

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
        validator: (arr) => 
          Array.isArray(arr) && 
          arr.length > 0 &&
          arr.length <= MAX_CATEGORY_COUNT,
        message: "There should be between 1 to ${MAX_CATEGORY_COUNT} categories."
      }
    },
    complexity: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"]
    },
    // categoryComplexityKey: {
    //   type: String,
    //   unique: true
    // }
    uniqueQuestionKey: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

questionSchema.index({ uniqueQuestionKey: 1 }, { unique: true });

// Auto-increment questionID before first save
questionSchema.pre("save", async function () {
  if (!this.isNew || this.questionID != null) {
    return;
  }

  const counter = await Counter.findOneAndUpdate(
    { name: "questionID" },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true }
  );

  this.questionID = counter.seq;
});

// Build stable unique key
questionSchema.pre("validate", function () {
  if (
    typeof this.title === "string" &&
    Array.isArray(this.category) &&
    this.category.length > 0 &&
    typeof this.complexity === "string"
  ) {
    const normalizedTitle = this.title.trim().toLowerCase();
    const normalizedSortedCategory = [...this.category]
      .map((cat) => cat.trim().toLowerCase())
      .sort();
    const normalizedComplexity = this.complexity.trim().toLowerCase();

    this.uniqueQuestionKey =
      `${normalizedTitle}|${normalizedComplexity}|${normalizedSortedCategory.join("|")}`;
  }
});

const Question = mongoose.model("Question", questionSchema);

export default Question;