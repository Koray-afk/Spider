const fs = require("fs");
const { analyzePage } = require("../services/gemini");

async function summarizePage(filePath, url = "") {
  const pageText = fs.readFileSync(filePath, "utf-8");
  const result = await analyzePage({
    url,
    content: pageText,
    screenshot: "pages/page-1.png",
  });

  console.log(JSON.stringify({ url, ...result }, null, 2));
}

summarizePage("pages/page-1.txt");