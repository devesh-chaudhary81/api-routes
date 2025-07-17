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




