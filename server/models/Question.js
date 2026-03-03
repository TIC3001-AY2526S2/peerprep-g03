import mongoose from "mongoose";
const questionSchema = new mongoose.Schema({
  questionID: Number,
  title: String,
  description: String
});

export default mongoose.model("Question", questionSchema);