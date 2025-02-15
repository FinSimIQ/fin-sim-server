const mongoose = require("mongoose");

const db = `mongodb+srv://${process?.env?.DB_USERNAME}:${process?.env?.DB_PASSWORD}@finsim.r16bl.mongodb.net/?retryWrites=true&w=majority&appName=FinSim`;

mongoose
	.connect(db)
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch((err) => {
		console.log("Error connecting to MongoDB", err);
	});

require("./DummyData.schema");
require("./User.schema");
require("./Quiz.schema");
require("./Question.schema");
require("./CourseContent.schema")