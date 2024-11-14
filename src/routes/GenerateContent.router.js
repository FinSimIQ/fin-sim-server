const express = require("express");
const router = express.Router();
const { generateCourseContent } = require("../controllers/GenerateContent.controller");

router.post("/", generateCourseContent);

module.exports = router;
