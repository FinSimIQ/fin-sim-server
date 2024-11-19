const mongoose = require("mongoose");
const Quiz = mongoose.model("Quiz");
const Question = mongoose.model("Question");
const helper = require("./LLM.controller");
const User = require("../models/User.model");
const { updateUserPoints } = require("../models/User.model");

const pointsTable = {
  regularQuiz: [
    { minScore: 0.9, points: 150 },
    { minScore: 0.7, points: 100 },
    { minScore: 0.5, points: 50 },
  ],
  weeklyChallenge: [
    { minScore: 0.9, points: 300 },
    { minScore: 0.7, points: 200 },
    { minScore: 0.5, points: 100 },
  ],
  courseCompletion: [
    { minScore: 0.9, points: 500 },
    { minScore: 0.7, points: 350 },
    { minScore: 0.5, points: 200 },
  ],
};

const OpenAI = require("openai");
const openai = new OpenAI();
require("dotenv").config();

// Create a custom quiz using provided name, difficulty, questions, and answers
const createCustomQuiz = async (req, res) => {
  const { name, difficulty, questions, answers } = req.body;

  // Validate input data
  if (
    !name ||
    !difficulty ||
    !questions ||
    !answers ||
    questions.length !== answers.length
  ) {
    return res.status(400).json({
      message:
        "Invalid input data. Ensure all fields are present and questions/answers arrays are of equal length.",
    });
  }

  // Create question-answer pairs
  const questionAnswerPairs = questions.map((question, index) => ({
    question,
    answer: answers[index],
  }));

  try {
    // Save the custom quiz to the database
    const newQuiz = new Quiz({ name, difficulty, questionAnswerPairs });
    const savedQuiz = await newQuiz.save();

    res
      .status(201)
      .json({ message: "Quiz created successfully", quiz: savedQuiz });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res
      .status(500)
      .json({ message: "Error creating quiz", error: error.message });
  }
};

const generateWeeklyQuizFunctionality = async () => {
  try {
    // get finance events from gpt
    const eventPrompt = `
  Summarize five major finance-related events that took place recently.
  Please respond in the following structured format:

  1. <Event 1>
  2. <Event 2>
  3. <Event 3>
  4. <Event 4>
  5. <Event 5>
  `;

    const eventsResponse = await helper(eventPrompt);
    const eventList = eventsResponse.split("\n").filter((line) => {
      return line.trim().match(/^\d+\./);
    });

    const questionIds = [];
    const questions = [];

    // loop over each event and generate questions and descriptions
    for (const event of eventList) {
      const questionPrompt = `Create a quiz question from the following event: ${event}.
      Please respond with the following format:
      - Question: <The quiz question>
      - Options:
      A) <Option A>
      B) <Option B>
      C) <Option C>
      D) <Option D>
      - Correct Answer: <The correct answer>`;
      const questionResponse = await helper(questionPrompt);
      const descriptionPrompt = `Provide a brief description of the event: ${event}`;
      const descriptionResponse = await helper(descriptionPrompt);

      const questionMatch = questionResponse.match(/Question:\s*(.*)/);
      const correctAnswerMatch = questionResponse.match(
        /Correct Answer:\s*(.*)/
      );
      const optionsMatch = questionResponse.match(
        /Options:\s*A\)\s*(.*)\s*B\)\s*(.*)\s*C\)\s*(.*)\s*D\)\s*(.*)/
      );

      if (!questionMatch || !correctAnswerMatch || !optionsMatch) {
        throw new Error("Invalid question or answer format from OpenAI");
      }

      const question = questionMatch[1].trim();
      const correctAnswer = correctAnswerMatch[1].trim();
      const options = [
        `A) ${optionsMatch[1].trim()}`,
        `B) ${optionsMatch[2].trim()}`,
        `C) ${optionsMatch[3].trim()}`,
        `D) ${optionsMatch[4].trim()}`,
      ];

      if (options.length !== 4 || options.includes(undefined)) {
        throw new Error("Invalid or incomplete options generated");
      }

      const newQuestion = new Question({
        question,
        answers: options,
        correctAnswer,
        description: descriptionResponse,
      });

      await newQuestion.save();
      questions.push(newQuestion);
      questionIds.push(newQuestion._id);
    }

    const newQuiz = new Quiz({
      title: "Weekly Finance Quiz!",
      description: "A quiz on recent finance events",
      questions,
      subject: "Fintech",
      events: eventList,
    });

    await newQuiz.save();

    console.log({ message: "Quiz created successfully", quiz: newQuiz });

    return newQuiz;
  } catch (error) {
    console.error("Error creating quiz:", error);
    throw error;
  }
};

const generateWeeklyQuiz = async (req, res) => {
  try {
    const newQuiz = await generateWeeklyQuizFunctionality();
    res.json({ message: "Quiz created successfully", quiz: newQuiz });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res
      .status(500)
      .json({ message: "Error creating quiz", error: error.message });
  }
};

// Existing function: createQuizWithQuestions
const createQuizWithQuestions = async (req, res) => {
  try {
    const newQuiz = await generateQuiz(req.body.topic, req.body.numOfQuestions);
    res.json({ message: "Quiz created successfully", quiz: newQuiz });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res
      .status(500)
      .json({ message: "Error creating quiz", error: error.message });
  }
};

// Existing function: generateQuiz
const generateQuiz = async (topic, numOfQuestions = 5) => {
  if (!topic) {
    throw new Error("Please provide a topic.");
  }

  try {
    const response = await openai.chat.completions.create(
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: "You are an expert professor on economics and finance that creates quizzes on various finance topics.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Create a quiz with ${numOfQuestions} questions on ${topic} along with their answers.`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const quiz = response.choices[0].message.content;
    console.log(quiz);
  } catch (error) {
    console.error("Error with OpenAI API:", error);
  }
};

const assignPoints = async (userId, quizType, scoreObtained, totalScore) => {
  try {
    const percentage = scoreObtained / totalScore;
    const quizConfig = pointsTable[quizType];

    if (!quizConfig) {
      throw new Error("Invalid quiz type");
    }

    // eetermine points based on the percentage score
    let points = 0;
    for (const tier of quizConfig) {
      if (percentage >= tier.minScore) {
        points = tier.points;
        break; // qssign the highest points tier that the score meets
      }
    }

    if (points > 0) {
      // use the method to get the user
      const user = await User.getUserByEmail(userId);
      if (!user || user.length === 0) throw new Error("User not found");

      // Uupdate user's total points and total quizzes
      const updatedUser = await updateUserPoints(userId, {
        totalPoints: user[0].totalPoints + points,
        totalQuizzes: user[0].totalQuizzes + 1,
      });

      return { success: true, pointsAwarded: points };
    }

    return {
      success: false,
      message: "Score did not meet any tier requirements",
    };
  } catch (error) {
    console.error("Error assigning points:", error);
    return { success: false, message: "An error occurred" };
  }
};

const completeQuiz = async (req, res) => {
  const { userId, quizType, scoreObtained, totalScore } = req.body;

  try {
    const result = await assignPoints(
      userId,
      quizType,
      scoreObtained,
      totalScore
    );

    if (result.success) {
      return res
        .status(200)
        .json({ message: "Points awarded", points: result.pointsAwarded });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error("Error completing quiz:", error);
    return res
      .status(500)
      .json({ message: "Error completing quiz", error: error.message });
  }
};

const getNewestWeeklyQuiz = async (req, res) => {
  try {
    const newestQuiz = await Quiz.findOne({ title: /Weekly Finance Quiz/i })
      .sort({ createdAt: -1 })
      .populate("questions");

    if (!newestQuiz) {
      return res.status(404).json({ message: "No weekly quizzes found" });
    }

    const validQuestions = newestQuiz.questions.map((question) => {
      if (!question.answers || question.answers.length !== 4) {
        throw new Error(`Question with ID ${question._id} has incomplete answers`);
      }
      return question;
    });

    res
      .status(200)
      .json({ message: "Newest weekly quiz retrieved", quiz: newestQuiz });
  } catch (error) {
    console.error("Error fetching newest weekly quiz:", error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const getQuizByWeek = async (req, res) => {
  const { weekOffset } = req.params; // weekOffset is number of weeks to travel back, 1 for last week, 2 for 2 weeks ago, etc.
  try {
    const currentDate = new Date();
    const targetDate = new Date();
    targetDate.setDate(currentDate.getDate() - weekOffset * 7);

    const startOfWeek = new Date(targetDate);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklyQuiz = await Quiz.findOne({
      title: /Weekly Finance Quiz/i,
      createdAt: { $gte: startOfWeek, $lte: endOfWeek },
    }).populate("questions");

    if (!weeklyQuiz) {
      return res
        .status(404)
        .json({ message: `No quiz found for week offset: ${weekOffset}` });
    }

    const validQuestions = weeklyQuiz.questions.map((question) => {
      if (!question.answers || question.answers.length !== 4) {
        throw new Error(`Question with ID ${question._id} has incomplete answers`);
      }
      return question;
    });

    res.status(200).json({
      message: `Quiz for week offset ${weekOffset} retrieved`,
      quiz: weeklyQuiz,
    });
  } catch (error) {
    console.error("Error fetching quiz by week:", error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const listQuizzesBySubject = async (req, res) => {
  const { subject } = req.params;
  try {
    const quizzes = await Quiz.find({ subject }).populate("questions");
    if (quizzes.length === 0) {
      return res
        .status(404)
        .json({ message: "No quizzes found for this subject" });
    }
    res.status(200).json(quizzes);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching quizzes by subject" });
  }
};

const listAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate("questions");
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching quizzes" });
  }
};

module.exports = {
  generateQuiz,
  listAllQuizzes,
  createCustomQuiz,
  listQuizzesBySubject,
  createQuizWithQuestions,
  completeQuiz,
  generateWeeklyQuizFunctionality,
  generateWeeklyQuiz,
  getNewestWeeklyQuiz,
  getQuizByWeek,
};
