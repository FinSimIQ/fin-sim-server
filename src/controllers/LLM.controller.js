const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process?.env?.CHATGPT_API_KEY,
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
      model: "gpt-4o-mini",
      //response_format: { type: "json_object" },
    });

    const response = completion.choices[0].message.content;
    return response;
  } catch (error) {
    res.status(500).json({ message: "Error calling llm", error: error.message });
  }
  
}

module.exports = helper;
