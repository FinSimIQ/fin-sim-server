const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    roomcode: { type: String, required: true, length: 6 },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Game", gameSchema);