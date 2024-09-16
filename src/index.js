// const env = require("dotenv");
// env.config();

// import libraries
const express = require("express");
const cors = require("cors");

const app = express();

const port = process?.env?.PORT || 8081;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
