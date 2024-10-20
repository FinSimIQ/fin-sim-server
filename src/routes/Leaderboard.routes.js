const express = require("express");
const router = express.Router();
const LeaderboardController = require("../controllers/Leaderboard.controller");

// Route to get the leaderboard
router.get("/", LeaderboardController.getLeaderboard);

module.exports = router;
