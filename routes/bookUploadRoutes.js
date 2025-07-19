import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ✅ Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/upload-book",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "contentURL", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const coverFile = req.files.coverImage[0];
      const pdfFile = req.files.contentURL[0];

      // Upload Cover Image
      const coverUpload = await cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "library/covers",
        },
        (error, result) => {
          if (error) throw error;

          // Upload PDF next
          cloudinary.uploader.upload_stream(
            {
              resource_type: "raw",
              folder: "library/pdfs",
            },
            (err, pdfResult) => {
              if (err) throw err;

              res.status(200).json({
                message: "Both files uploaded successfully",
                coverImageURL: result.secure_url,
                pdfURL: pdfResult.secure_url,
              });
            }
          ).end(pdfFile.buffer);
        }
      ).end(coverFile.buffer);

    } catch (error) {
      res.status(500).json({
        error: "Upload failed",
        details: error.message,
      });
    }
  }
);

export default router;


// reuploadOneBook.js

// import mongoose from 'mongoose';
// import axios from 'axios';
// import multer from "multer";
// import { v2 as cloudinary } from 'cloudinary';
// import dotenv from 'dotenv';
// import Book from '../model/book.js'; // adjust path if needed

// dotenv.config();

// // Cloudinary config
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_API_SECRET,
// });

// async function reuploadOnePDF() {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('✅ Connected to MongoDB');

//     // 🔍 Find one book by title (change to _id if needed)
//     const book = await Book.findOne({ title: 'Java Essentials' });

//     if (!book) {
//       console.log('❌ Book not found');
//       return;
//     }

//     console.log(`🔄 Re-uploading: ${book.title}`);

//     // 1. Download old PDF file
//     const response = await axios.get(book.contentURL, {
//       responseType: 'arraybuffer',
//     });

//     const fileBuffer = response.data;

//     // 2. Re-upload to Cloudinary
//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         {
//           resource_type: 'raw',
//           folder: 'library/pdfs-fixed', // or use your desired folder
//         },
//         (error, result) => {
//           if (error) return reject(error);
//           resolve(result);
//         }
//       );
//       stream.end(fileBuffer);
//     });

//     // 3. Save old URL (optional) and update to new one
//     book.oldContentURL = book.contentURL;
//     book.contentURL = uploadResult.secure_url;
//     await book.save();

//     console.log(`✅ Book updated with new URL: ${book.contentURL}`);
//   } catch (err) {
//     console.error('❌ Error:', err.message);
//   } finally {
//     await mongoose.disconnect();
//     console.log('🔌 MongoDB disconnected');
//   }
// }

// reuploadOnePDF();


// import mongoose from 'mongoose';
// import axios from 'axios';
// import { v2 as cloudinary } from 'cloudinary';
// import dotenv from 'dotenv';
// import Book from './models/bookModel.js'; // Adjust path to your model

// dotenv.config();

// // Cloudinary config
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_API_SECRET,
// });

// async function reuploadOnePDF() {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('✅ Connected to MongoDB');

//     // 🔍 Find one book by title or _id
//     const book = await Book.findOne({ title: 'Java Basics' }); // change title as needed

//     if (!book) {
//       console.log('❌ Book not found');
//       return;
//     }

//     console.log(`🔄 Re-uploading: ${book.title}`);

//     // 1. Download old PDF file
//     const response = await axios.get(book.contentURL, {
//       responseType: 'arraybuffer',
//     });

//     const fileBuffer = response.data;

//     // 2. Upload to Cloudinary with correct config
//     const uploadResult = await new Promise((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         {
//           resource_type: 'raw',
//             type: 'upload',
//           folder: 'library/pdfs-fixed', // you can change folder name
//         },
//         (error, result) => {
//           if (error) return reject(error);
//           resolve(result);
//         }
//       );
//       stream.end(fileBuffer);
//     });

//     // 3. Update MongoDB record with new URL
//     book.oldContentURL = book.contentURL; // optional backup
//     book.contentURL = uploadResult.secure_url;
//     await book.save();

//     console.log(`✅ Book updated: ${book.contentURL}`);
//   } catch (err) {
//     console.error('❌ Error:', err.message);
//   } finally {
//     await mongoose.disconnect();
//     console.log('🔌 MongoDB disconnected');
//   }
// }

// reuploadOnePDF();