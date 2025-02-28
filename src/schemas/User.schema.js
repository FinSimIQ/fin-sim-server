// user model

// import mongoose
const mongoose = require("mongoose");

// define user model schema
const userSchema = new mongoose.Schema({
	fullName: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	resetToken: { type: String, default: null }, 
	resetTokenExpires: { type: Date, default: null },
	totalPoints: { type: Number, required: false, default: 0, min: 0 },
	totalQuizzes: { type: Number, required: false, default: 0, min: 0 },
	quizzesCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

// export user model
module.exports = mongoose.model("User", userSchema);