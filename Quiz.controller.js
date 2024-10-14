// quizController.js
const Quiz = require("../models/Quiz");

// Controller for listing all quizzes
exports.listAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("questions");
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching quizzes" });
  }
};

// Controller for listing quizzes by subject
exports.listQuizzesBySubject = async (req, res) => {
  const { subject } = req.params;
  try {
    const quizzes = await Quiz.find({ subject }).populate("questions");
    if (quizzes.length === 0) {
      return res.status(404).json({ message: "No quizzes found for this subject" });
    }
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching quizzes by subject" });
  }
};
