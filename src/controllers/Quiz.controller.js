const OpenAI = require("openai");
const openai = new OpenAI();
require("dotenv").config();

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

module.exports = { generateQuiz };
