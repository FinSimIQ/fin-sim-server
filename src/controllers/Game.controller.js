const gameModel = require('../models/Game.model');
const Quiz = require('../schemas/Quiz.schema');

const createGame = async (req, res) => {
    try {
        const quizId = req.body.quiz;
        console.log(quizId);
        const quiz = await Quiz.findById(quizId);
        console.log(quiz);
        if (!quiz) {
            return res.json({ message: "failure", reason: "quiz not found" });
        }
        const game = await gameModel.createGame(quizId);
        console.log(game);
        res.json(game);
    } catch (e) {
        res.json({ message: 'failure', reason: e.message });
    }
};

module.exports = { createGame };