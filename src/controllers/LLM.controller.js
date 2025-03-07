const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process?.env?.OPENAI_API_KEY,
});

async function helper(text) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: text,
        },
      ],
      model: "chatgpt-4o-latest",
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message.content;
    return response;
  } catch (error) {
    console.error("Error generating content:", error);
  }
}

module.exports = helper;
