import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  AdminId: { type: Number, unique: true, required: true },
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['superadmin', 'moderator'], default: 'moderator' }
});
        
export default  mongoose.model('admin', adminSchema);
