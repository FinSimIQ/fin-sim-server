const Game = require('../schemas/Game.schema');

const createGame = async (quizId) => {
    let code = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return await Game.create({ roomcode: code, quiz: quizId });å
};

module.exports = { createGame };