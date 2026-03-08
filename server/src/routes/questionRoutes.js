// route definitions
import express from "express";
import {
  getAllQuestions,
  createQuestion,
  updateQuestion,
} from "../controllers/questionController.js";

const router = express.Router();

router.get("/", getAllQuestions);
router.post("/", createQuestion);
router.put("/:id", updateQuestion);

export default router;