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
import book from "../model/book.js";
import User from '../model/user.js';
 // ✅ lowercase "book"

const router = Router();

router.get("/", getBooks)
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
router.get("/:id", getBookById)

async function summarizeTextRange(text) {
  const headers = {
    "x-apihub-key": "c7YICTGCb37mKlCnKrXwE0LscPYfv2ORjUIjamdDqs-nLUEHwK",
    "x-apihub-host": "Cheapest-GPT-AI-Summarization.allthingsdev.co",
    "x-apihub-endpoint": "cba23f99-e8fb-4d0c-ab0b-2e0b38cc47b4",
    "Content-Type": "application/json"
  };

 const prompt = `
 🧠 OBJECTIVE
You are an intelligent quiz generator for digital learning. Given cleaned educational text from a book or study material, your task is to generate 10 high-quality multiple-choice questions (MCQs) that help students test their understanding of the topic.


 📚 QUIZ GENERATION RULES
Cover a wide range of concepts across the input text.

Include a mix of question types:

Recall (facts, terms, definitions)

Understanding (explain ideas, relationships)

Application (apply ideas in context)

Use student-friendly wording – clear, academic, but not overly complex.

Avoid filler or obviously wrong options — all choices should be plausible.

Ensure only one correct answer per question.

Do not repeat questions or options.

Avoid asking questions that rely on content not present in the input.

💡 QUALITY STANDARDS
Varied difficulty (easy to moderate-hard).

Well-balanced across the content: don’t focus too much on a single part.

Use accurate facts and logical reasoning based on the input.

No typos or grammar mistakes.

Make it usable for frontend quiz interfaces.
.

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
router.post("/quiz-by-range", async (req, res) => {
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

router.post('/open', async (req, res) => {
  const { userId, bookId, timeSpent } = req.body;

  if (!userId || !bookId) {
    return res.status(400).json({ error: 'Missing userId or bookId' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const today = new Date().toDateString();

    const alreadyViewedToday = user.bookViews.some(view => {
      const viewedDate = new Date(view.viewedAt).toDateString();
      return view.bookId.toString() === bookId && viewedDate === today;
    });

    if (!alreadyViewedToday) {
      user.bookViews.unshift({
        bookId,
        viewedAt: new Date(),
        timeSpent: timeSpent || 0,
      });

      await user.save();
    }

    // ✅ This line was outside the try block before – fixed now
    res.status(200).json({
      message: alreadyViewedToday ? 'Already logged today' : 'Book view logged successfully'
    });

  } catch (err) {
    console.error('Error in /api/books/open:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



// routes/userRoutes.js


export default router;

