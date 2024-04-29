import { Configuration, OpenAIApi } from "openai-edge";

const configuration = new Configuration({
  apiKey: process.env.GEMINI_API,
});
export const openai = new OpenAIApi(configuration);
