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
import BookRead from '../model/BookRead.js'
import mongoose from "mongoose";
import Book from '../model/book.js';
 // ✅ lowercase "book"

const router = Router();

router.get("/", getBooks)
router.post("/", AddBook)
// router.put("/:id", updateBook)
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
    }).select('title author coverImageURL averageRating');

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
 🧠 OBJECTIVE
You are an intelligent quiz generator for digital learning. Given cleaned educational text from a book or study material, your task is to generate 10 high-quality multiple-choice questions (MCQs) that help students test their understanding of the topic.

📚 QUIZ GENERATION RULES
1. Cover a wide range of concepts across the input text.
2. Include a mix of question types:
   - Recall (facts, terms, definitions)
   - Understanding (explain ideas, relationships)
   - Application (apply ideas in context)
3. Use student-friendly wording – clear, academic, but not overly complex.
4. Avoid filler or obviously wrong options — all choices should be plausible.
5. Ensure only one correct answer per question.
6. Do not repeat questions or options.
7. Avoid asking questions that rely on content not present in the input.

💡 QUALITY STANDARDS
1. Varied difficulty (easy to moderate-hard).
2. Well-balanced across the content: don’t focus too much on a single part.
3. Use accurate facts and logical reasoning based on the input.
4. No typos or grammar mistakes.
5. Make it usable for frontend quiz interfaces.

📦 OUTPUT FORMAT (STRICTLY FOLLOW THIS JSON you dont have any other option otherwise it will fail. striclty strictly follow this json)

  [
    {
      "question": "string",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "one of the options"
    },
  
  ]



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
    console.log(result);
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
    let summary = await summarizeTextRange(cleaned);

    console.log("✅ Range summary generated.");
    const start = summary.indexOf("[");
  const end = summary.lastIndexOf("]") + 1;

  summary = summary.substring(start,end);

    console.log(summary);
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


router.post("/Notes-by-range", async (req, res) => {
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
    const summary = await notesByRange(cleaned);

    console.log("✅ Range summary generated.");
    res.json({ summary });
  } catch (err) {
    console.error("❌ Range Summary Error:", err);
    res.status(500).json({ error: "Failed to summarize the page range." });
  }
});




async function notesByRange(text) {
  const headers = {
    "x-apihub-key": "c7YICTGCb37mKlCnKrXwE0LscPYfv2ORjUIjamdDqs-nLUEHwK",
    "x-apihub-host": "Cheapest-GPT-AI-Summarization.allthingsdev.co",
    "x-apihub-endpoint": "cba23f99-e8fb-4d0c-ab0b-2e0b38cc47b4",
    "Content-Type": "application/json"
  };

 const prompt = `
You are an intelligent academic note generator for digital learning platforms. Given clean, extracted educational text (from a book, textbook, or academic resource), your task is to generate well-structured, comprehensive study notes based on a specified page range. These notes will help students quickly understand and revise the content.

📘 INPUT FORMAT
You will receive:

Cleaned text content extracted from a book or study material.

A page range (e.g., from page 15 to page 22) that the user selects as the scope for note generation.

🧾 NOTE GENERATION RULES
Organize the content clearly using appropriate:

Main headings (based on major topics)

Subheadings (to break down key concepts)

Paragraphs (for clear explanation)

Bullet points or numbered lists (for definitions, features, steps, advantages, etc.)

Highlight important terms or concepts (bold or italicize where appropriate)

Maintain logical flow and structure:

Start with an overview/introduction if applicable

Break down the content sequentially as it appears in the page range

Use consistent formatting for each section

Content types to include:

Key definitions and terms

Important formulas or diagrams (describe them if image is not present)

Summary of theories, principles, or models

Examples and applications if mentioned

Comparison tables or structured lists (if content suits that format)

Use academic yet student-friendly language:

Clear, concise, and easy to read

Avoid overly complex jargon unless essential, and explain it if used

🧩 QUALITY STANDARDS
Notes must be accurate, complete, and logically structured

Cover all important concepts in the selected range

Avoid copying the text verbatim unless quoting a definition — paraphrase and condense

No spelling or grammar errors

No repetition or filler content

Ensure the output is frontend-display friendly (usable in a React/HTML UI)q

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


router.post("/stats/update-reading-time", async (req, res) => {
  try {
    console.log("start update the timer");
    const { bookId, userId,minutesRead } = req.body;
    console.log(req.body);
   
 
   
 
    const existing = await BookRead.findOne({ userId, bookId });
 
    if (existing) {
      existing.totalReadingTime += minutesRead;
      existing.updatedAt = Date.now();
      await existing.save();
    } else {
      await BookRead.create({ userId:userId, bookId:bookId, minutesRead: minutesRead });
    }
 
    res.status(200).json({ message: "Reading time updated successfully" });
  } catch (error) {
    console.error("Error updating reading time:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reading-stats", async (req, res) => {
  console.log("📊 Start fetching reading stats");
 
  const { userId } = req.query;
 
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid or missing userId' });
  }
 
  try {
    // Fetch BookRead entries
    const allReads = await BookRead.find({ userId }).sort({ minutesRead: -1 }).lean();
 
    console.log("📚 allReads:", allReads);
 
    const recentReads = allReads.slice(0, 10);
 
    const books = [];
 
    for (const entry of recentReads) {
      console.log(entry);
      const Book = await book.findById(entry.bookId);  // Manual lookup by String bookId
      if (Book) {
        books.push({
          name: Book.title,
          value: entry.minutesRead,
        });
      } else {
        console.warn(`⚠️ Book not found for bookId: ${entry.bookId}`);
      }
    }
 
    console.log("📊 Final chart data:", books);
    res.status(200).json(books);
 
  } catch (err) {
    console.error("❌ reading-stats error:", err.stack || err.message);
    res.status(500).json({ error: 'Server Error while fetching reading stats' });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const bookId = req.params.id;

    // Check if ID is a valid MongoDB ObjectId
    if (!bookId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid book ID format" });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
})



router.post("/:bookId/rate", async (req, res) => {
  try {
    const { bookId } = req.params;
    const { userId, rating } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Check if user already rated
    const existingRating = book.ratings.find(r => r.userId.toString() === userId);
    if (existingRating) {
      existingRating.rating = rating; // Update rating
    } else {
      book.ratings.push({ userId, rating });
    }

    book.calculateAverageRating();
    await book.save();

    res.json({ averageRating: book.averageRating, ratingsCount: book.ratings.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;