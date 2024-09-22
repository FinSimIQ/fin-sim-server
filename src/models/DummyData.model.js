const mongoose = require("mongoose");

const DummyDataSchema = new mongoose.Schema({
  field1: {
    type: String,
  },
  field2: {
    type: String,
  },
});

mongoose.model("DummyData", DummyDataSchema);
