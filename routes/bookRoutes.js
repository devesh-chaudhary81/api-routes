import { Router } from "express";
import {AddBook,deleteBook, getBookById, getBooks, updateBook, getSummary} from "../controller/bookController.js";
import book from "../model/book.js"; // ✅ lowercase "book"

const router = Router();

router.get("/", getBooks)
// router.get("/:id", getBookById)
router.post("/", AddBook)
router.put("/:id", updateBook)
router.delete("/:id", deleteBook)
router.get("/:id/summary", getSummary)

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






export default router;