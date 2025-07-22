import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type:String, default: () => new mongoose.Types.ObjectId().toString() },
  name: {type:String,required:true},
  email: { type: String,unique:true,required:true },
  username:{type:String},
  password: {type:String,required:true}, // hashed
  preferredLanguage: { type: String, default: 'en' },
  interests: [String], // ['fiction', 'java', 'science']

  subscriptionStatus: { type: String, enum: ['free', 'premium', 'expired'], default: 'free' },
  subscriptionDetails: {
    startDate: Date,
    endDate: Date,
    plan: { type: String, enum: ['monthly', 'yearly'] }
  },

  myShelf: [
    {
      bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'book' },
      lastPageRead: { type: Number, default: 0 }
    }
  ],
favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'book' }],
totalReadingTime: { type: Number, default: 0 }, // in minutes
bookViews: [
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'book' },
    viewedAt: { type: Date, default: Date.now }
  }
],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export default mongoose.model("user", userSchema)