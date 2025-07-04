import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  bookId: { type: Number, unique: true, required: true },
  title: { en: String, hi: String, fr: String },
  author: String,
  description: { en: String, hi: String, fr: String },
  categories: [String],
  genres: [String],
  tags: [String],
  totalPages: Number,
  content: [{ language: String, contentURL: String }],
  aiSummary: [{ language: String, summaryText: String }],
  coverImageURL: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


export default mongoose.model("book", bookSchema)