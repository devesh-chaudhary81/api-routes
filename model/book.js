import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  bookId: {type:String, default: () => new mongoose.Types.ObjectId().toString() },
  title: { type:String},
  author: String,
  description: { type:String},
  categories: [String],
  genres: [String],
  totalPages: Number,
  coverImageURL: { type: String},
  contentURL:{type:String},
  aiSummary: [{ language: String, summaryText: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


export default mongoose.model("book", bookSchema)