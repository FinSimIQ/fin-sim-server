const mongoose = require("mongoose");
const Quiz = mongoose.model("Quiz");
const Question = mongoose.model("Question");
const helper = require("./LLM.controller");

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
        const eventList = eventsResponse.split("\n").filter(line => {
            return line.trim().match(/^\d+\./);
        });
        
        console.log("Filtered Events:", eventList);
        const questionIds = [];

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
            const correctAnswerMatch = questionResponse.match(/Correct Answer:\s*(.*)/);
            const optionsMatch = questionResponse.match(/Options:\s*A\)\s*(.*)\s*B\)\s*(.*)\s*C\)\s*(.*)\s*D\)\s*(.*)/);

            if (!questionMatch || !correctAnswerMatch || !optionsMatch) {
                throw new Error("Invalid question or answer format from the OpenAI API");
            }

            const question = questionMatch[1].trim();
            const correctAnswer = correctAnswerMatch[1].trim();
            const options = [
                `A) ${optionsMatch[1].trim()}`,
                `B) ${optionsMatch[2].trim()}`,
                `C) ${optionsMatch[3].trim()}`,
                `D) ${optionsMatch[4].trim()}`
            ];

            // create a new question entry in the database
            const newQuestion = new Question({
                question: question,
                answers: options,
                correctAnswer: correctAnswer,
                description: descriptionResponse 
            });

            await newQuestion.save();
            questionIds.push(newQuestion._id);
        }

        // create a new quiz using the questions generated
        const newQuiz = new Quiz({
            title: "Weekly Finance Quiz!",
            description: "A quiz on recent finance events", 
            questions: questionIds,
            events: eventList,
        });

        await newQuiz.save();
        res.json({ message: "Quiz created successfully", quiz: newQuiz });
    } catch (error) {
        console.error("Error creating quiz:", error);
        res.status(500).json({ message: "Error creating quiz", error: error.message });
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

module.exports = { generateQuiz, createQuizWithQuestions };
