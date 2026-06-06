const fs = require("fs");
const { analyzeText } = require("../services/gemini");

async function summarizePage(filePath) {
  const pageText = fs.readFileSync(
    filePath,
    "utf-8"
  );

  const prompt = `
Analyze this webpage.

Return:

1. Page Type
2. Purpose
3. Main CTA
4. Important Sections
5. Short Summary

Content:

${pageText}
`;

  const result = await analyzeText(prompt);

  console.log(result);
}

summarizePage("pages/page-1.txt");