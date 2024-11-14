const mongoose = require("mongoose");

const CourseContentSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  difficulty: { type: String, required: true },
  subtopics: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
  ],
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
});

module.exports = mongoose.model("CourseContent", CourseContentSchema);
