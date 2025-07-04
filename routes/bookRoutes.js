import { Router } from "express";
import {AddBook,deleteBook, getBookById, getBooks, updateBook, getSummary} from "../controller/bookController.js";

const router = Router();

router.get("/", getBooks)
router.get("/:id", getBookById)
router.post("/", AddBook)
router.put("/:id", updateBook)
router.delete("/:id", deleteBook)
router.get("/:id/summary", getSummary)

export default router;