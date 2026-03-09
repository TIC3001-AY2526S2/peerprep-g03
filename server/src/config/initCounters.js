import Question from "../models/Question.js";
import Counter from "../models/Counter.js";

const syncQuestionIdCounter = async () => {
  const highestQuestion = await Question.findOne().sort({ questionID: -1 });
  const maxQuestionId = highestQuestion ? highestQuestion.questionID : 0;

  const existingCounter = await Counter.findOne({ name: "questionID" });

  if (!existingCounter || existingCounter.seq < maxQuestionId) {
    const updatedCounter = await Counter.findOneAndUpdate(
      { name: "questionID" },
      { $set: { seq: maxQuestionId } },
      { upsert: true, returnDocument: "after" }
    );
    // console.log("SYNC updated counter to:", updatedCounter.seq);
  } else {
    console.log("SYNC counter already valid");
  }
};

export default syncQuestionIdCounter;