const Quiz = require('../models/Quiz.model');

// Create a new quiz
exports.createQuiz = async (req, res) => {
  const { title, description, questions } = req.body;


  if (!title || !description || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: "Invalid input data" });
  }

  try {
    const newQuiz = new Quiz({ title, description, questions });
    const savedQuiz = await newQuiz.save();
    
    res.status(201).json({ message: "Quiz created successfully", quiz: savedQuiz });
  } catch (error) {
    res.status(500).json({ message: "Error creating quiz", error });
  }
};
