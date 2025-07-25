import mongoose from "mongoose";

const bookReadSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'book',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
  pagesRead: {
    type: Number,
    default: 0,  // 🆕 Field to store number of pages read in a session
  },
  minutesRead: {
    type: Number,
    default: 0,
  },
  // in minutes
  lastOpened: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("BookRead", bookReadSchema);