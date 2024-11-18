const express = require("express");
const router = express.Router();
const QuizController = require("../controllers/Quiz.controller");

router.post("/create", QuizController.createQuizWithQuestions);
router.post("/generate", QuizController.generateQuiz);
router.post("/complete", QuizController.completeQuiz);
router.get("/weekly-quiz/latest", quizController.getNewestWeeklyQuiz);
router.get("/weekly-quiz/:weekOffset", quizController.getQuizByWeek);

module.exports = router;
