const mongoose = require("mongoose");
const Quiz = mongoose.model("Quiz");
const Question = mongoose.model("Question");
const helper = require("./LLM.controller");

const OpenAI = require("openai");
const openai = new OpenAI();
require("dotenv").config();

// Create a custom quiz using provided name, difficulty, questions, and answers
const createCustomQuiz = async (req, res) => {
  const { name, difficulty, questions, answers } = req.body;

  // Validate input data
  if (!name || !difficulty || !questions || !answers || questions.length !== answers.length) {
    return res.status(400).json({ message: "Invalid input data. Ensure all fields are present and questions/answers arrays are of equal length." });
  }

  // Create question-answer pairs
  const questionAnswerPairs = questions.map((question, index) => ({
    question,
    answer: answers[index]
  }));

  try {
    // Save the custom quiz to the database
    const newQuiz = new Quiz({ name, difficulty, questionAnswerPairs });
    const savedQuiz = await newQuiz.save();
    
    res.status(201).json({ message: "Quiz created successfully", quiz: savedQuiz });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ message: "Error creating quiz", error: error.message });
  }
};

// Existing function: createQuizWithQuestions
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
      events: eventList,
    });

    await newQuiz.save();
    res.json({ message: "Quiz created successfully", quiz: newQuiz });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ message: "Error creating quiz", error: error.message });
  }
};

// Existing function: generateQuiz
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
                text: "You are an expert professor on economics and finance that creates quizzes on various finance topics.",
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

module.exports = { generateQuiz, createQuizWithQuestions, createCustomQuiz };
