// configure env variables
const env = require("dotenv");
env.config();

// import libraries & functions
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db")

const app = express();

// connect to MongoDB
connectDB();

// routes


// start server
const port = process?.env?.PORT || 8081;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});