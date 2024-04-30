const { GeminiAPI } = require("@google/generative-ai");

const geminiAPI = new GeminiAPI(process.env.GEMINI_API);

export async function palmGetQuestionFromTranscript(transcript: string, chapter_title: string) {
  const model = geminiAPI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = JSON.stringify({
    messages: [
      {
        role: "system",
        content: "You are an AI bot that only answers in JSON. Generate at least a 3 question educational informative quiz on the text given above. The questions should be on the material of the entire transcript as a whole. The question should be knowledgeable and not about the specifics. The output has to be an array of questions. Each question should have a question, which is a string question, the choices, which is 3 possible answer choices represented in an array, and the answer."
      },
      {
        role: "user",
        content: "here is an example: " + JSON.stringify([
          {
            question: "What is (sqrt(16)+5-4)/1/24",
            choices: ["120", "40", "12"],
            answer: "100"
          },
          {
            question: "What is a forrier trnasformation?",
            choices: ["a transform that converts a function into a form that describes the frequencies present in the original function", "infinite sum of terms that approximate a function as a polynomial", "mathematical function that can be formally defined as an improper Riemann integral"],
            answer: "certain kind of approximation of an integral by a finite sum"
          }
        ])
      },
      {
        role: "user",
        content: "here is the transcript: " + transcript + "\n return the answer in json format, example : {'questions': 'your questions here'}"
      }
    ]
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const data = await response.json();
  let res = JSON.parse(data.choices[0].message?.content) as { questions: { question: string, choices: string[], answer: string }[] };
  return res.questions;
}
