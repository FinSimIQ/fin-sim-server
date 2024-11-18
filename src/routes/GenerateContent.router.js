const express = require("express");
const router = express.Router();
const {
  generateCourseContent,
  getAllCourses,
} = require("../controllers/GenerateContent.controller");

router.post("/", generateCourseContent);
router.get("/", getAllCourses);

module.exports = router;
