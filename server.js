import express from 'express'
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from "cors";
import userRoutes from './routes/userRoutes.js'
import bookRoutes from './routes/bookRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js' 
import adminRoutes from './routes/adminRoutes.js'
import bookUploadRoutes from './routes/bookUplaodRoutes.js'
// import path from "path";


const app = express();
const allowedOrigins = ["http://localhost:5174"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
dotenv.config();


// cloudinary.config({
//      cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_API_SECRET,
// });




const PORT = process.env.PORT

mongoose
    .connect(process.env.MONGO_URI)
    .then(()=> console.log(`Connected Successfully with MondoDB`))
    .catch(()=> console.error(`Error to Connected`))




app.use(express.json());
app.use("/api/users",userRoutes);
app.use("/api/books",bookRoutes);
app.use("/api",feedbackRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api", bookUploadRoutes);

app.listen(PORT, ()=>console.log(`Server started http://localhost:${PORT}`))