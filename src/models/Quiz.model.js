const mongoose = require("mongoose");

const questionAnswerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  answer: { type: String, required: true }
});

const quizSchema = new mongoose.Schema({
  name: { type: String, required: true },
  difficulty: { type: String, enum: ["beginner", "intermediate", "hard"], required: true },
  questionAnswerPairs: [questionAnswerSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model("Quiz", quizSchema);
