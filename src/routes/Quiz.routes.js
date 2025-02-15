const express = require("express");
const router = express.Router();
const QuizController = require("../controllers/Quiz.controller");

router.post("/create", QuizController.createQuizWithQuestions);
router.post("/generate-weekly", QuizController.generateWeeklyQuiz);
router.post("/complete", QuizController.completeQuiz);
router.get("/quizzes", QuizController.listAllQuizzes);
router.get("/quizzes/subject/:subject", QuizController.listQuizzesBySubject);
router.get("/weekly-quiz/latest", QuizController.getNewestWeeklyQuiz);
router.get("/weekly-quiz/:weekOffset", QuizController.getQuizByWeek);

module.exports = router;
