// route definitions
import express from "express";
import { getAllQuestions, createQuestion } from "../controllers/questionController.js";

const router = express.Router();

router.get("/", getAllQuestions);
router.post("/", createQuestion);

export default router;