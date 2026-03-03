// route definitions
const express = require("express");
const { getAllQuestions, createQuestion } = require("../controllers/questions");

const router = express.Router();

router.get("/questions", getAllQuestions);
router.post("/question", createQuestion);

module.exports = router;