const { Configuration, GeminiAPI } = require("@google/generative-ai");

const configuration = new Configuration({
  apiKey: process.env.GEMINI_API,
});

export const geminiAPI = new GeminiAPI(configuration);
