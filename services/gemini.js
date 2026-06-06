require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");

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

    visualObservations: {
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
    "visualObservations",
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

async function analyzePage({ url, content , screenshot }) {

const imageBytes = fs.readFileSync(screenshot);
const imageBase64 = imageBytes.toString("base64");

console.log("screenshot:", screenshot);
console.log("base64 length:", imageBase64.length);
console.log("preview:", imageBase64.slice(0, 80) + "...");

  const prompt = `
Analyze this webpage using BOTH:

1. Screenshot
2. Extracted page text

Determine:

- Page type
- Page purpose
- Primary call-to-action
- Important sections
- Visual observations
- Summary

Visual observations should describe:

- Layout structure
- Design style
- Prominent buttons
- Hero sections
- Navigation
- Visual hierarchy

Return valid JSON only.

URL:
${url}

CONTENT:
${content}


`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{
      text: prompt,
    },
    {
      inlineData: {
        mimeType: "image/png",
        data: imageBase64,
      },
    },],
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

