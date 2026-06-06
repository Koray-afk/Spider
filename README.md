# Spider

Crawls a website and uses AI to analyze every page — its purpose, layout, and calls-to-action. Point it at a URL, it visits pages, takes screenshots, and returns a structured JSON report for each one.

---

## Architecture

```
Start URL
    │
    ▼
┌─────────────────────────────┐
│         crawler.js          │
│  - Launches headless Chrome │
│  - Visits each page         │
│  - Takes full screenshot    │
│  - Extracts visible text    │
│  - Follows internal links   │
└────────────┬────────────────┘
             │ saves to pages/
             ▼
┌─────────────────────────────┐
│   analyze-all-pages.js      │
│  - Reads pages/results.json │
│  - Loads screenshot + text  │
│  - Sends both to Gemini AI  │
│  - Saves structured report  │
└────────────┬────────────────┘
             │ saves to analysis/
             ▼
     analysis/page-N.json
  (pageType, purpose, mainCTA,
   sections, visual notes, summary)
```

---

## Tech Stack

| | |
|---|---|
| **Playwright** | Headless Chrome — visits pages like a real browser |
| **Gemini 2.5 Flash** | Multimodal AI — reads both the screenshot and page text |
| **Node.js** | Runtime |
| **dotenv** | Loads API key from `.env` |

---

## Installation

**Requirements:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Install the browser Playwright uses
npx playwright install chromium
```

---

## Configuration

Create a `.env` file in the project root:

```
GEMINI_API_KEY=your_key_here
```

Get a free key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).

To change the target site or page limit, edit these two lines in `crawler.js`:

```js
const startUrl = "https://example.com";
const MAX_PAGES = 10;
```

---

## Usage

```bash
# Step 1 — crawl the site
node crawler.js

# Step 2 — create the output folder
mkdir analysis

# Step 3 — run AI analysis on all pages
node processors/analyze-all-pages.js
```

Results land in `analysis/page-N.json`.

---

## Project Structure

```
spider/
├── crawler.js                  # crawls the site, saves pages/
├── processors/
│   ├── analyze-all-pages.js    # runs AI on every crawled page
│   └── summarize-page.js       # analyze a single page (quick test)
├── services/
│   └── gemini.js               # all Gemini API logic
├── pages/                      # auto-created: screenshots, html, text
├── analysis/                   # auto-created: AI reports per page
└── .env                        # API key — never commit this
```

---

## Troubleshooting

- **`Cannot find pages/results.json`** — run `crawler.js` first
- **`GEMINI_API_KEY is not set`** — check your `.env` file
- **`analysis/ not found`** — run `mkdir analysis` before the analyzer
