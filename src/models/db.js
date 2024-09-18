const mongoose = require("mongoose");

const db = `mongodb+srv://${process?.env?.DB_USERNAME}:${process?.env?.DB_PASSWORD}@finsim.r16bl.mongodb.net/?retryWrites=true&w=majority&appName=FinSim`;

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

require("./DummyData.model");
