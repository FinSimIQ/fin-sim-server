// question model

// import mongoose
const mongoose = require("mongoose");

// define question model schema
const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answers: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true }
})

// export question model
module.exports = mongoose.model("Question", questionSchema)