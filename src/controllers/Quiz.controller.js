const OpenAI = require("openai");
const openai = new OpenAI();
const axios = require("axios");

const generateQuiz = async (req, res) => {
  const { topic } = req.body;
  console.log(req, res);
  if (!topic) {
    return res.status(400).json({ error: "Please provide a topic." });
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
          Authorization: `Bearer OPEN_API_KEY`,
        },
      }
    );

    const quiz = response.data.choices[0].message.content;

    console.log("Generated Quiz:", quiz);
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    res.status(500).json({ error: "Failed to generate quiz questions" });
  }
};

module.exports = { generateQuiz };
