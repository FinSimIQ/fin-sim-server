const env = require("dotenv");
env.config();

require("./schemas/db");

// import libraries & functions
const express = require("express");
const cors = require("cors");
// const connectDB = require("./config/db");

const app = express();

// connect to MongoDB
// connectDB();

app.use(cors({ origin: "*" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// import controllers
const dummyDataController = require("./controllers/DummyData.controller");
const userRoutes = require("./routes/User.routes");

const leaderboardRoutes = require("./routes/Leaderboard.routes");
const quizRoutes = require("./routes/Quiz.routes");
const contentGenerationRoutes = require("./routes/GenerateContent.router")

// adding the controller
app.use("/api/DummyData", dummyDataController);
app.use("/api/users", userRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/generate-course-content", contentGenerationRoutes)

app.get("/", (req, res) => {
	res.send("Hello World!");
});

const port = process?.env?.PORT || 8081;
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

const cron = require("node-cron");
const { generateWeeklyQuiz } = require("./controllers/Quiz.controller");
cron.schedule("59 23 * * Sun", generateWeeklyQuiz, {
	scheduled: true,
	timezone: "Europe/London",
});
