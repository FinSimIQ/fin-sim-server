const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const DummyData = mongoose.model("DummyData");

// // example GET endpoint that gets all database objects from a collection
// router.get("/get", (req, res) => {
//   DummyData.find()
//     .then((result) => {
//       console.debug("Retrieved all dummy database objects");
//       res.send({ result: result }).status(200);
//     })
//     .catch((error) => {
//       console.error("Unable to retrieve all dummy database objects", error);
//       res.send({ message: "failure", reason: error }).status(500);
//     });
// });

// // example POST endpoint that creates a database object
// router.post("/create", (req, res) => {
//   const dummyData = new DummyData();
//   dummyData.field1 = req.body.field1;
//   dummyData.field2 = req.body.field2;
//   dummyData
//     .save()
//     .then((result) => {
//       console.debug("Saved dummy database object");
//       res
//         .send({
//           message: "successfully created new dummy database object",
//           result: result,
//         })
//         .status(200);
//     })
//     .catch((error) => {
//       console.error("Unable to save dummy database object", error);
//       res.send({ message: "failure", reason: error }).status(500);
//     });
// });

module.exports = router;
