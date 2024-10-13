const express = require("express");
const { generateQuiz } = require("../controllers/Quiz.controller");

const router = express.Router();

router.post("/generate", generateQuiz);

module.exports = router;
