import { Router } from "express";
import {AddBook,deleteBook, getBookById, getBooks, updateBook, getSummary} from "../controller/bookController.js";

const router = Router();

router.get("/", getBooks)
router.get("/:id", getBookById)
router.post("/", AddBook)
router.put("/:id", updateBook)
router.delete("/:id", deleteBook)
router.get("/:id/summary", getSummary)

router.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    const books = await book.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { categories: { $regex: query, $options: 'i' } },
        { genres: { $regex: query, $options: 'i' } },
      ]
    });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});


export default router;