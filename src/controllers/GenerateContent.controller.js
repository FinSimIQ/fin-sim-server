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
    const subtopics = await generateSubtopics(topic, description, difficulty);

    // generate quiz for Each Subtopic Using `generateQuiz`
    // const quizzes = await Promise.all(
    //   subtopics.map(async (subtopic) => {
    //     return await generateQuiz(subtopic.title);
    //   })
    // );

    // const quizzes = await generateQuiz(topic, 5);
    const quizzes = [];

    // save course content, subtopics, and quizzes in database
    const newCourseContent = {
      topic,
      difficulty,
      subtopics: subtopics.subtopics,
      description,
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
      Generate three subtopics for a course based on the following information. Each subtopic should be relevant to the main topic and consider the specified difficulty level. Ensure that the subtopics are unique, that there are atleast 3 subtopics (going upto 6 max) and that there is a list of atleast 2 paragraph descriptions for each subtopic (separate every paragraph into a new element in description array so there should be atleast 2 elements in the array). Respond in the following JSON format:
      {topic: <topic>, description: <description>, difficulty: <difficulty>, subtopics: [{title: <title>, description: [<descriptions>]}]}
      Topic: ${topic}
      Description: ${description}
      Difficulty: ${difficulty}
    `;
  const response = await helper(JSON.stringify(subtopicPrompt));
  console.log(response);
  const subtopics = await JSON.parse(response);
  console.log(subtopics);

  return subtopics;

  /*
  const response = await helper(subtopicPrompt);

  const subtopics = [];
  const subtopicRegex = /Subtopic \d: (.+)\nDescription \d: (.+)/g;
  let match;

  while ((match = subtopicRegex.exec(response)) !== null) {
    const [_, title, description] = match;
    subtopics.push({ title, description });
  }

  return subtopics;
  */
};

const CourseContent = mongoose.model("CourseContent");
const saveCourseContent = async (content) => {
  const { topic, difficulty, subtopics, quizzes, description } = content;
  console.log(content);

  const validQuizzes = quizzes.filter((quiz) => quiz && quiz._id);

  const newContent = new CourseContent({
    topic,
    difficulty,
    subtopics,
    description,
    quizzes: validQuizzes.map((quiz) => quiz._id),
  });

  return await newContent.save();
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await CourseContent.find().populate("quizzes");
    console.log(courses);
    res.json(courses);
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
