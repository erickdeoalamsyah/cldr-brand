import { Router } from "express";
import multer from "multer";
import { cloudinary, CLOUDINARY_FOLDER } from "../../config/cloudinary";
import { authRequired, adminOnly } from "../../middlewares/auth.middleware";

const router = Router();

// in-memory, langsung di-stream ke Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/admin/uploads/image",
  authRequired,           // cek JWT dulu
  adminOnly,              // pastikan role = ADMIN
  upload.single("file"),  // form-data field: "file"
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "File tidak ditemukan",
        });
      }

      const buffer = req.file.buffer;

      const result: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: CLOUDINARY_FOLDER,
            resource_type: "image",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

      return res.status(201).json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
