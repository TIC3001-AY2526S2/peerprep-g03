import Question from "../models/Question.js";
import Counter from "../models/Counter.js";

const syncQuestionIdCounter = async () => {
  const highestQuestion = await Question.findOne().sort({ questionId: -1 });
  const maxQuestionId = highestQuestion ? highestQuestion.questionId : 0;

  const existingCounter = await Counter.findOne({ name: "questionId" });

  console.log("SYNC highest questionId:", maxQuestionId);
  console.log("SYNC existing counter:", existingCounter ? existingCounter.seq : null);

  if (!existingCounter || existingCounter.seq < maxQuestionId) {
    const updatedCounter = await Counter.findOneAndUpdate(
      { name: "questionId" },
      { $set: { seq: maxQuestionId } },
      { upsert: true, returnDocument: "after" }
    );
    console.log("SYNC updated counter to:", updatedCounter.seq);
  } else {
    console.log("SYNC counter already valid");
  }
};

export default syncQuestionIdCounter;