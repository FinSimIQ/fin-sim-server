// quiz model

// import mongoose
const mongoose = require("mongoose");

// define quiz model schema
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: {
    type: String,
    required: true,
    enum: [
      "Stock Market",
      "Personal Finance",
      "Fintech",
      "Investment",
      "Risk Management",
      "Financial Analysis",
      "Quantitative Finance",
      "Financial Modeling",
      "Trading",
    ], // Restrict subjects to the predefined nine categories
  },
  questions: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  ],
});

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);

// export quiz model
module.exports = Quiz;