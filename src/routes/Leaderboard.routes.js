const express = require("express");
const router = express.Router();
const LeaderboardController = require("../controllers/Leaderboard.controller");

router.get("/", LeaderboardController.getLeaderboard);

module.exports = router;
