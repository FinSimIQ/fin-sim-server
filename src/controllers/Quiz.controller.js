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

const createQuizWithQuestions = async (req, res) => {
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

    console.log("Filtered Events:", eventList);
    const questionIds = [];
    const questions = [];

    // loop over each event and generate questions and descriptions
    for (const event of eventList) {
      // generate a question and correct answer for each event
      const questionPrompt = `Create a quiz question from the following event: ${event}.
            Please respond with the following format:
            - Question: <The quiz question>
            - Options:
            A) <Option A>
            B) <Option B>
            C) <Option C>
            D) <Option D>
            - Correct Answer: <The correct answer> (e.g., B) To curb inflation)`;
      const questionResponse = await helper(questionPrompt);
      const descriptionPrompt = `Provide a breif description of the event: ${event}, focusing on the key finance-related impacts and outcomes. Make sure it's no more than three lines.`;
      const descriptionResponse = await helper(descriptionPrompt);

      // extract the structured response
      const questionMatch = questionResponse.match(/Question:\s*(.*)/);
      const correctAnswerMatch = questionResponse.match(
        /Correct Answer:\s*(.*)/
      );
      const optionsMatch = questionResponse.match(
        /Options:\s*A\)\s*(.*)\s*B\)\s*(.*)\s*C\)\s*(.*)\s*D\)\s*(.*)/
      );

      if (!questionMatch || !correctAnswerMatch || !optionsMatch) {
        throw new Error(
          "Invalid question or answer format from the OpenAI API"
        );
      }

      const question = questionMatch[1].trim();
      const correctAnswer = correctAnswerMatch[1].trim();
      const options = [
        `A) ${optionsMatch[1].trim()}`,
        `B) ${optionsMatch[2].trim()}`,
        `C) ${optionsMatch[3].trim()}`,
        `D) ${optionsMatch[4].trim()}`,
      ];

      // create a new question entry in the database
      const newQuestion = new Question({
        question: question,
        answers: options,
        correctAnswer: correctAnswer,
        description: descriptionResponse,
      });

      await newQuestion.save();
      questions.push(newQuestion);
      questionIds.push(newQuestion._id);
    }

    // create a new quiz using the questions generated
    const newQuiz = new Quiz({
      title: "Weekly Finance Quiz!",
      description: "A quiz on recent finance events",
      questions: questions,
      events: eventList,
    });

    await newQuiz.save();
    res.json({ message: "Quiz created successfully", quiz: newQuiz });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res
      .status(500)
      .json({ message: "Error creating quiz", error: error.message });
  }
};

const generateQuiz = async (topic) => {
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
                text: "You are a expert professor on economics and finance that creates quizzes on various finance topics.",
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Create a quiz with ten questions on ${topic} along with their answers.`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`,
        },
      }
    );

    const quiz = response.choices[0].message.content;
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

    return { success: false, message: "Score did not meet any tier requirements" };
  } catch (error) {
    console.error("Error assigning points:", error);
    return { success: false, message: "An error occurred" };
  }
};


const completeQuiz = async (req, res) => {
  const { userId, quizType, scoreObtained, totalScore } = req.body;

  try {
    const result = await assignPoints(userId, quizType, scoreObtained, totalScore);

    if (result.success) {
      return res.status(200).json({ message: "Points awarded", points: result.pointsAwarded });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error("Error completing quiz:", error);
    return res.status(500).json({ message: "Error completing quiz", error: error.message });
  }
};


module.exports = { generateQuiz, createQuizWithQuestions, completeQuiz };
