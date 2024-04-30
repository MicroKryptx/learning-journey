const { GeminiAPI } = require("@google/generative-ai");

const geminiAPI = new GeminiAPI(process.env.GEMINI_API);

const chapterTitles = ['differentation', 'integration', 'fourier transformation'];
const title = 'math';

async function generateSummary() {
    const model = geminiAPI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
        please provide a fake 200 word summary for a video on ${chapterTitles[0]}.
        answer in {summary: 'your summary here'}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const data = await response.json();
    let res = JSON.parse(data.choices[0].message?.content);
    console.log(JSON.stringify(res, null, 2));
}

generateSummary();
