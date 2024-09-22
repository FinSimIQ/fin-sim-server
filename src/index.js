const env = require("dotenv");
env.config();

require("./models/db");

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

// adding the controller
app.use("/api/DummyData", dummyDataController);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = process?.env?.PORT || 8081;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
