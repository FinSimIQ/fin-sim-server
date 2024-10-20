const express = require("express");
const router = express.Router();
const QuizController = require("../controllers/Quiz.controller");

router.post("/create", QuizController.createQuizWithQuestions);

router.post("/generate", QuizController.generateQuiz);

module.exports = router;
