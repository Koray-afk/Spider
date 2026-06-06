require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const PAGE_ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    pageType: { type: "string" },
    purpose: { type: "string" },
    mainCTA: { type: "string" },
    importantSections: {
      type: "array",
      items: { type: "string" },
    },
    summary: { type: "string" },
  },
  required: [
    "pageType",
    "purpose",
    "mainCTA",
    "importantSections",
    "summary",
  ],
};

function parseJsonResponse(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  const jsonText = fenced ? fenced[1].trim() : trimmed;

  return JSON.parse(jsonText);
}

async function analyzeText(text) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: text,
  });

  return response.text;
}

async function analyzePage({ url, content }) {
  const prompt = `
Analyze this webpage and return structured metadata about it.

URL:
${url}

CONTENT:
${content}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: PAGE_ANALYSIS_SCHEMA,
    },
  });

  return parseJsonResponse(response.text);
}

module.exports = {
  analyzeText,
  analyzePage,
};
