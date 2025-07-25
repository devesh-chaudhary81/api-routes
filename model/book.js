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
  updatedAt: { type: Date, default: Date.now },
  bookViews: [
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    viewedAt: { type: Date, default: Date.now },
    timeSpent: { type: Number, default: 0 }, // in minutes
  }
],

 ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
      rating: { type: Number, min: 1, max: 5 }
    }
  ],
  averageRating: { type: Number, default: 0 }


});

bookSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const total = this.ratings.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = total / this.ratings.length;
  }
};


export default mongoose.model("book", bookSchema)