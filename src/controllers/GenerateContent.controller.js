const mongoose = require("mongoose");
const helper = require("./LLM.controller");
const { generateQuiz } = require("./Quiz.controller");

const generateCourseContent = async (req, res) => {
  const { topic, difficulty, description } = req.body;

  if (!topic || !difficulty || !description) {
    return res
      .status(400)
      .json({ message: "Topic, difficulty, and description are required." });
  }

  try {
    // generate subtopics
    const subtopics = await generateSubtopics(topic, description);

    // generate quiz for Each Subtopic Using `generateQuiz`
    const quizzes = await Promise.all(
      subtopics.map(async (subtopic) => {
        return await generateQuiz(subtopic.title);
      })
    );

    // save course content, subtopics, and quizzes in database
    const newCourseContent = {
      topic,
      difficulty,
      subtopics,
      quizzes,
    };

    const savedContent = await saveCourseContent(newCourseContent);
    res.status(201).json({
      message: "Course content created successfully",
      content: savedContent,
    });
  } catch (error) {
    console.error("Error generating course content:", error);
    res.status(500).json({
      message: "Error generating course content",
      error: error.message,
    });
  }
};

const generateSubtopics = async (topic, description, difficulty) => {
  const subtopicPrompt = `
      Generate three subtopics for a course based on the following information. Each subtopic should be relevant to the main topic and consider the specified difficulty level. 
      Respond in a structured format to ensure easy parsing, as shown below.
  
      Topic: ${topic}
      Description: ${description}
      Difficulty: ${difficulty}
  
      Format your response strictly as follows:
      Subtopic 1: <Subtopic title>
      Description 1: <Description of subtopic 1>
      Subtopic 2: <Subtopic title>
      Description 2: <Description of subtopic 2>
      Subtopic 3: <Subtopic title>
      Description 3: <Description of subtopic 3>
    `;

  const response = await helper(subtopicPrompt);

  const subtopics = [];
  const subtopicRegex = /Subtopic \d: (.+)\nDescription \d: (.+)/g;
  let match;

  while ((match = subtopicRegex.exec(response)) !== null) {
    const [_, title, description] = match;
    subtopics.push({ title, description });
  }

  return subtopics;
};

const CourseContent = mongoose.model("CourseContent");
const saveCourseContent = async (content) => {
  const { topic, difficulty, subtopics, quizzes } = content;

  const validQuizzes = quizzes.filter((quiz) => quiz && quiz._id);

  const newContent = new CourseContent({
    topic,
    difficulty,
    subtopics,
    quizzes: validQuizzes.map((quiz) => quiz._id),
  });

  return await newContent.save();
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await CourseContent.find().populate("quizzes");
    res.json({ courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res
      .status(500)
      .json({ message: "Error fetching courses", error: error.message });
  }
};

module.exports = {
  generateCourseContent,
  getAllCourses,
};
