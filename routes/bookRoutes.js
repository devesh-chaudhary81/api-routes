// import { Router } from "express";
// import {AddBook,deleteBook, getBookById, getBooks, updateBook, getSummary} from "../controller/bookController.js";
// import book from "../model/book.js"; // ✅ lowercase "book"

// const router = Router();

// router.get("/", getBooks)
// router.get('/search', async (req, res) => {
//   const { query } = req.query;

//   if (!query || typeof query !== 'string') {
//     return res.status(400).json({ error: 'Query string is required' });
//   }

//   try {
//     const trimmedQuery = query.trim();
//     const words = trimmedQuery.split(/\s+/); // split by space

//     const regexWords = words.map(word =>
//       new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') // escape and case-insensitive
//     );

//     console.log(`🔍 Searching for words:`, words);

//     const books = await book.find({
//       $or: [
//         // Match if any word is in the title (regex partial match)
//         ...regexWords.map((regex) => ({ title: { $regex: regex } })),

//         // Match if any word is exactly in categories
//         { categories: { $in: words } },

//         // Match if any word is exactly in genres
//         { genres: { $in: words } },
//       ]
//     });

//     console.log(`✅ Found ${books.length} book(s)`);
//     res.status(200).json(books);
//   } catch (error) {
//     console.error("❌ Search Error:", error.stack);
//     res.status(500).json({ error: "Internal server error", details: error.message });
//   }
// });
// router.get("/:id", getBookById)
// router.post("/", AddBook)
// router.put("/:id", updateBook)
// router.delete("/:id", deleteBook)
// // router.get("/:id/summary", getSummary)








// export default router;



import { Router } from "express";
import fs from "fs/promises";
import pdfParse from "pdf-parse";
import multer from 'multer';
import fetch from 'node-fetch';
import { PDFDocument } from 'pdf-lib';

import {
  AddBook,
  deleteBook,
  getBooks,
  updateBook,
  getSummary,
} from "../controller/bookController.js";

import book from "../model/book.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

// 📚 CRUD Routes
router.get("/", getBooks);
router.post("/", AddBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);
router.get("/summary", getSummary);

// 🔍 Book Search Route
router.get("/search", async (req, res) => {
  const { query } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Query string is required" });
  }

  try {
    const regex = new RegExp(query.trim(), "i");
    const books = await book.find({
      $or: [
        { title: regex },
        { categories: { $elemMatch: { $regex: regex } } },
        { genres: { $elemMatch: { $regex: regex } } },
      ],
    });

    res.status(200).json(books);
  } catch (error) {
    console.error("❌ Search Error:", error.stack);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});



// 🧠 Summarization function
async function summarizeText(text) {
  const headers = {
    "x-apihub-key": "c7YICTGCb37mKlCnKrXwE0LscPYfv2ORjUIjamdDqs-nLUEHwK",
    "x-apihub-host": "Cheapest-GPT-AI-Summarization.allthingsdev.co",
    "x-apihub-endpoint": "cba23f99-e8fb-4d0c-ab0b-2e0b38cc47b4",
    "Content-Type": "application/json"
  };

  const prompt = `You are a helpful assistant summarizing the content of a book page.

Summarize the given content clearly and concisely, in a well-structured format.

**Guidelines**:
- Provide a heading for the overall topic.
- Use bullet points for key ideas.
- Include subheadings if the content has sections or concepts.
- Focus only on meaningful and educational points.
- Keep it short, informative, and readable.

Output format:
---
## [Main Heading]

### [Subheading 1]
- Bullet point 1
- Bullet point 2

### [Subheading 2]
- Bullet point 1
- Bullet point 2
---


Content:\n${text}`;

  const body = JSON.stringify({ text: prompt, length: "15", style: "text" });

  try {
    const res = await fetch("https://Cheapest-GPT-AI-Summarization.proxy-production.allthingsdev.co/api/summarize", {
      method: "POST",
      headers,
      body
    });

    const resultText = await res.text();
    const result = JSON.parse(resultText);
    return result?.summary || result?.result || "[No summary returned]";
  } catch (err) {
    console.error("❌ Error summarizing:", err.message);
    return "[Summarization failed]";
  }
}


// 📄 Upload PDF and return summarized content
router.post("/summary-by-page", async (req, res) => {
  const { pdfUrl, pageNumber } = req.body;

  if (!pdfUrl || !pageNumber) {
    return res.status(400).json({ error: "pdfUrl and pageNumber are required" });
  }

  try {
    console.log("🔹 Downloading PDF...");
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    const fullPdfBytes = await response.arrayBuffer();

    console.log("🔹 Loading PDF...");
    const fullPdfDoc = await PDFDocument.load(fullPdfBytes);
    const newPdfDoc = await PDFDocument.create();
    const totalPages = fullPdfDoc.getPageCount();

    if (pageNumber < 1 || pageNumber > totalPages) {
      return res.status(400).json({ error: `Page number must be between 1 and ${totalPages}` });
    }

    console.log(`🔹 Extracting page ${pageNumber}...`);
    const [extractedPage] = await newPdfDoc.copyPages(fullPdfDoc, [pageNumber - 1]);
    newPdfDoc.addPage(extractedPage);
    const singlePagePdfBytes = await newPdfDoc.save();

    console.log("🔹 Parsing PDF...");
    const parsed = await pdfParse(singlePagePdfBytes);
    let rawText = parsed.text;

    console.log("🔹 Cleaning text...");
    let cleaned = rawText
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[^a-zA-Z0-9.,;:'\"()?!\- ]/g, "")
      .trim();

    if (!cleaned || cleaned.length < 10) {
      return res.status(400).json({ error: "Not enough text found on this page to summarize." });
    }

    console.log("🔹 Summarizing text...");
    const summary = await summarizeText(cleaned);

    console.log("✅ Summary generated.");
    res.json({ summary: summary.trim() });
  } catch (err) {
    console.error("❌ Page Summary Error:", err);
    res.status(500).json({ error: "Failed to summarize specific page." });
  }
});



router.post('/open', async (req, res) => {
  const { url, bookId } = req.body;
  console.log(`User started reading book ${bookId} from URL: ${url}`);
  res.json({ message: "Book opened logged" });
});

export default router;