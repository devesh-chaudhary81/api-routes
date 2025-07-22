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
import {AddBook,deleteBook, getBookById, getBooks, updateBook} from "../controller/bookController.js";

import fs from "fs/promises";
import pdfParse from "pdf-parse";
import multer from 'multer';
import fetch from 'node-fetch';
import { PDFDocument } from 'pdf-lib';
 // ✅ lowercase "book"

const router = Router();

router.get("/", getBooks)
// router.get("/:id", getBookById)
router.post("/", AddBook)
router.put("/:id", updateBook)
router.delete("/:id", deleteBook)

router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query string is required' });
  }

  try {
    const trimmedQuery = query.trim();
    console.log("🔍 Received search query:", trimmedQuery);

    const regex = new RegExp(trimmedQuery, 'i');
    console.log("🧩 Using regex:", regex);

    const books = await book.find({
      $or: [
        { title: regex },
        { categories: { $elemMatch: { $regex: regex } } },
        { genres: { $elemMatch: { $regex: regex } } }
      ]
    });

    console.log(`✅ Found ${books.length} book(s)`);
    res.status(200).json(books);
  } catch (error) {
    console.error("❌ Search Error:", error.stack);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});
async function summarizeTextRange(text) {
  const headers = {
    "x-apihub-key": "c7YICTGCb37mKlCnKrXwE0LscPYfv2ORjUIjamdDqs-nLUEHwK",
    "x-apihub-host": "Cheapest-GPT-AI-Summarization.allthingsdev.co",
    "x-apihub-endpoint": "cba23f99-e8fb-4d0c-ab0b-2e0b38cc47b4",
    "Content-Type": "application/json"
  };

 const prompt = `
You are an intelligent virtual study assistant that extracts highly structured, educational notes from textbooks and study material. The user provides you cleaned text extracted from a specific range of book pages . Your task is to create frontend-friendly, aesthetically formatted, and deeply meaningful notes.

🧠 OBJECTIVE
Generate human-like, well-organized chapter-wise notes suitable for display in an online library or e-learning platform.

📝 OUTPUT STRUCTURE
Use proper Markdown formatting with spacing for clear readability and frontend styling.

📌 Title (H1)

Create a bold, informative title summarizing the content of the selected page range.

Make it short, engaging, and meaningful (not just "Chapter 1").

## Main Headings (H2)

Identify 2–6 major concepts or sections within the content.

Label each with meaningful H2 markdown.

(Add one empty line after each H2 for spacing.)

### Subheadings (H3)

Under each H2, break down into key subtopics using H3.

Each subheading must include a short paragraph summary, followed by bullet points.

(Add one empty line after each H3 for spacing.)

- Bullet Points:

Use - for bullet points.

Each point should include:

Key ideas

Bold definitions or terms

Short examples, dates, formulas, or keywords

Be clear, focused, and student-friendly

✨ Summary Line (Optional)

At the end of each subheading, include a 1-line italic summary or key takeaway.

🖼️ FORMATTING RULES
Use Markdown (#, ##, ###) for all headings and subheadings.

Add one empty line after each heading and subheading for visual separation.

Use bold (**term**) for important concepts.

Do not return unstructured paragraphs.

Make it visually scannable — like well-prepared study notes.

Ensure frontend compatibility: notes should look neat when rendered on a webpage.

🔍 TONE & QUALITY
Academic but engaging.

Like a top-performing student’s notes.

Avoid fluff or overly technical jargon.

Prioritize understanding, not just summarizing.

${text}
`;


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
    console.error("❌ Error summarizing range:", err.message);
    return "[Summarization failed]";
  }
}



// 📄 Upload PDF and return summarized content
router.post("/summary-by-range", async (req, res) => {
  const { pdfUrl, startPage, endPage } = req.body;

  if (!pdfUrl || !startPage || !endPage) {
    return res.status(400).json({ error: "pdfUrl, startPage, and endPage are required" });
  }

  if (endPage - startPage + 1 > 20) {
    return res.status(400).json({ error: "Page range should not exceed 20 pages." });
  }

  try {
    console.log("🔹 Downloading PDF...");
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error("Failed to fetch PDF");
    const fullPdfBytes = await response.arrayBuffer();

    const fullPdfDoc = await PDFDocument.load(fullPdfBytes);
    const newPdfDoc = await PDFDocument.create();
    const totalPages = fullPdfDoc.getPageCount();

    if (startPage < 1 || endPage > totalPages) {
      return res.status(400).json({ error: `Page range must be between 1 and ${totalPages} `});
    }

    console.log(`🔹 Extracting pages ${startPage} to ${endPage}...`);
    const pageIndexes = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => i + startPage - 1
    );

    const extractedPages = await newPdfDoc.copyPages(fullPdfDoc, pageIndexes);
    extractedPages.forEach((page) => newPdfDoc.addPage(page));

    const rangePdfBytes = await newPdfDoc.save();
    const parsed = await pdfParse(rangePdfBytes);
    const rawText = parsed.text;

    const cleaned = rawText
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[^a-zA-Z0-9.,;:'\"()?!\- ]/g, "")
      .trim();

    if (!cleaned || cleaned.length < 30) {
      return res.status(400).json({ error: "Not enough valid text found in the selected pages." });
    }

    console.log("🔹 Summarizing the full range...");
    const summary = await summarizeTextRange(cleaned);

    console.log("✅ Range summary generated.");
    res.json({ summary });
  } catch (err) {
    console.error("❌ Range Summary Error:", err);
    res.status(500).json({ error: "Failed to summarize the page range." });
  }
});
export default router;