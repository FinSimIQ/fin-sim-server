const express = require("express");
const router = express.Router();
const quizController = require("../controllers/Quiz.controller");

// Route to get all quizzes
router.get("/quizzes", quizController.listAllQuizzes);

// Route to get quizzes by subject
router.get("/quizzes/subject/:subject", quizController.listQuizzesBySubject);

module.exports = router;