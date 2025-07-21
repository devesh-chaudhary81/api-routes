import express from 'express'
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from "cors";
import userRoutes from './routes/userRoutes.js'
import bookRoutes from './routes/bookRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js' 
import adminRoutes from './routes/adminRoutes.js'
import bookUploadRoutes from './routes/bookUploadRoutes.js'
import otpRoutes from './routes/otpRoutes.js'
// import path from "path";


dotenv.config();
const app = express();
const allowedOrigins = ["http://localhost:5173","https://frontend-for-virtual-library.vercel.app"];

// app.use(cors({
//   origin: allowedOrigins,
//   credentials: true,
// }));
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin like curl or mobile apps
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
// app.options('*', cors());
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
app.use("/api/otp", otpRoutes);

app.listen(PORT, ()=>console.log(`Server started http://localhost:${PORT}`))