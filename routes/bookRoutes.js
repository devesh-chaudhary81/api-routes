import { Router } from "express";
import {AddBook,deleteBook, getBookById, getBooks, updateBook, getSummary} from "../controller/bookController.js";
import book from "../model/book.js"; // ✅ lowercase "book"

const router = Router();

router.get("/", getBooks)
router.get("/:id", getBookById)
router.post("/", AddBook)
router.put("/:id", updateBook)
router.delete("/:id", deleteBook)
router.get("/:id/summary", getSummary)





// router.get('/search', async (req, res) => {
//   const { query } = req.query;

//   if (!query || typeof query !== 'string') {
//     return res.status(400).json({ error: 'Query string is required' });
//   }

//   try {
//     const trimmedQuery = query.trim();
//     const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex chars
//     const titleRegex = new RegExp(escapedQuery, 'i');

//     console.log(`🔍 Searching for: ${trimmedQuery}`);

//     const books = await book.find({
//       $or: [
//         { title: { $regex: titleRegex } },
//         { categories: trimmedQuery }, // exact match in array
//         { genres: trimmedQuery }      // exact match in array
//       ]
//     });

//     console.log(`✅ Found ${books.length} book(s)`);
//     res.status(200).json(books);
//   } catch (error) {
//     console.error("❌ Search Error:", error.stack);
//     res.status(500).json({ error: "Internal server error", details: error.message });
//   }
// });

router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query string is required' });
  }

  try {
    const trimmedQuery = query.trim();
    const words = trimmedQuery.split(/\s+/); // split by space

    const regexWords = words.map(word =>
      new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') // escape and case-insensitive
    );

    console.log(`🔍 Searching for words:`, words);

    const books = await book.find({
      $or: [
        // Match if any word is in the title (regex partial match)
        ...regexWords.map((regex) => ({ title: { $regex: regex } })),

        // Match if any word is exactly in categories
        { categories: { $in: words } },

        // Match if any word is exactly in genres
        { genres: { $in: words } },
      ]
    });

    console.log(`✅ Found ${books.length} book(s)`);
    res.status(200).json(books);
  } catch (error) {
    console.error("❌ Search Error:", error.stack);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});





export default router;