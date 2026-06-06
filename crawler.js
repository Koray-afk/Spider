// crawler.js

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

(async () => {
  const startUrl = "https://playvalorant.com/en-us/?adjust_referrer=adjust_reftag%3DcR0QiehlMCeis&gad_campaignid=18632367525&gad_source=1&gbraid=0AAAAADidvFxKGd7nTP9KE9KVCFV9-lRwI&gclsrc=aw.ds:/";

  const MAX_PAGES = 10;

  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage();
  // Create pages folder if not exists
  if (!fs.existsSync("pages")) {
    fs.mkdirSync("pages");
  }

  const queue = [startUrl];
  const visited = new Set();
  const results = [];

  const domain = new URL(startUrl).origin;

  const normalizeUrl = (url) => {
    try {
      return url.split("#")[0].replace(/\/$/, "");
    } catch {
      return url;
    }
  };

  while (queue.length > 0 && visited.size < MAX_PAGES) {
    const currentUrl = normalizeUrl(queue.shift());

    if (visited.has(currentUrl)) {
      continue;
    }

    visited.add(currentUrl);

    console.log(
      `\n[${visited.size}/${MAX_PAGES}] Visiting: ${currentUrl}`
    );

    try {
      await page.goto(currentUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      const pageNumber = visited.size;

      // =====================
      // Screenshot
      // =====================

      const screenshotPath = `pages/page-${pageNumber}.png`;

      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      // =====================
      // HTML
      // =====================

      const html = await page.content();

      const htmlPath = `pages/page-${pageNumber}.html`;

      fs.writeFileSync(htmlPath, html);

      // =====================
      // Visible Text
      // =====================

      const text = await page.locator("body").innerText();

      const textPath = `pages/page-${pageNumber}.txt`;

      fs.writeFileSync(textPath, text);

      // =====================
      // Store Metadata
      // =====================

      results.push({
        pageNumber,
        url: currentUrl,
        screenshot: screenshotPath,
        html: htmlPath,
        text: textPath,
      });

      // =====================
      // Discover Links
      // =====================

      const links = await page.$$eval("a", (anchors) =>
        anchors.map((a) => a.href)
      );

      const internalLinks = [
        ...new Set(
          links
            .map(normalizeUrl)
            .filter(
              (link) =>
                link &&
                link.startsWith(domain) &&
                !link.startsWith("mailto:") &&
                !link.startsWith("javascript:")
            )
        ),
      ];

      for (const link of internalLinks) {
        if (
          !visited.has(link) &&
          !queue.includes(link)
        ) {
          queue.push(link);
        }
      }

      console.log(
        `Found ${internalLinks.length} internal links`
      );

      console.log(
        `Queue Size: ${queue.length}`
      );

    } catch (error) {
      console.log(
        `Failed: ${currentUrl}`
      );

      console.log(error.message);
    }
  }

  // Save crawl results

  fs.writeFileSync(
    "pages/results.json",
    JSON.stringify(results, null, 2)
  );

  console.log("\n==========");
  console.log(`Pages Crawled: ${visited.size}`);
  console.log(`Results Saved`);
  console.log("==========\n");

  await browser.close();
})();