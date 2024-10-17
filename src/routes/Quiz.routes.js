const express = require('express');
const router = express.Router();
const QuizController = require('../controllers/Quiz.controller');


router.post('/create', QuizController.createQuiz);

module.exports = router;
