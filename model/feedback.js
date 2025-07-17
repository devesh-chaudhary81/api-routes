import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: {type:String},
  fullName:{type:String},
  email:{type:String},
  age:{type:Number},
  city:{type:String},
  createdAt: { type: Date, default: Date.now }
});

 export default mongoose.model('feedback', feedbackSchema);
