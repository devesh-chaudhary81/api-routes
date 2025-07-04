import express from 'express'
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from "cors";
import userRoutes from './routes/userRoutes.js'
import bookRoutes from './routes/bookRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js' 
import adminRoutes from './routes/adminRoutes.js'
// import path from "path";


const app = express();
app.use(cors());
dotenv.config();




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

app.listen(PORT, ()=>console.log(`Server started http://localhost:${PORT}`))