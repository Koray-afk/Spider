require('dotenv').config();
const {GoogleGenAI} = require('@google/genai');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});


async function analyzeText(text) {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: text,
    });
  
    return response.text;
  }
  
module.exports = {
    analyzeText,
  };
