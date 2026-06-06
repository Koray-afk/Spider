const fs = require("fs");
const { analyzePage } = require("../services/gemini");

async function analyzeAllPages() {
  const results = JSON.parse(
    fs.readFileSync("pages/results.json", "utf-8")
  );

  for (const page of results) {
    console.log(`Analyzing Page ${page.pageNumber}`);

    const pageText = fs.readFileSync(page.text, "utf-8");
    const analysis = await analyzePage({
      url: page.url,
      content: pageText,
    });

    const output = {
      url: page.url,
      ...analysis,
    };

    fs.writeFileSync(
      `analysis/page-${page.pageNumber}.json`,
      JSON.stringify(output, null, 2)
    );

    console.log(`Saved page-${page.pageNumber}.json`);
  }
}

analyzeAllPages();
