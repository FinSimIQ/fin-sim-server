const express = require('express');
const router = express.Router();
const QuizController = require('../controllers/Quiz.controller');
  
router.post("/create", QuizController.createQuizWithQuestions);

module.exports = router;