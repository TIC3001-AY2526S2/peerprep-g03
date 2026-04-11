import mongoose from "mongoose";
import Counter from "./Counter.js";

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
        message: "At least one category is required"
      }
    },
    complexity: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"]
    },
    categoryComplexityKey: {
      type: String,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

// Auto-increment questionID before first save
questionSchema.pre("save", async function () {
  if (!this.isNew || this.questionID != null) {
    // return next();
    return;
  }

  try {
    const counter = await Counter.findOneAndUpdate(
      { name: "questionID" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    this.questionID = counter.seq;
  } catch (error) {
    console.log(error);
  }
});

// Derive stable uniqueness key from category + complexity
questionSchema.pre("validate", function () {
  if (Array.isArray(this.category) && this.category.length > 0 && this.complexity) {
    const normalizedSortedCategory = [...this.category]
      .map((cat) => cat.trim().toLowerCase())
      .sort();

    this.categoryComplexityKey =
      `${this.complexity.trim().toLowerCase()}|${normalizedSortedCategory.join("|")}`;
  }
});

const Question = mongoose.model("Question", questionSchema);

export default Question;