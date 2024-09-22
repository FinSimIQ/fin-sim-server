// quiz model

// import mongoose
const mongoose = require("mongoose");

// define quiz model schema
const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true }]
})

// export quiz model
module.exports = mongoose.model("Quiz", quizSchema)