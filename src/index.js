const env = require("dotenv");
env.config();

require("./models/db");

// import libraries
const express = require("express");
const cors = require("cors");

const app = express();

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
  console.log(`Example app listening on port ${port}`);
});
