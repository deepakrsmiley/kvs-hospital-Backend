import multer from "multer";
import path from "path";

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|svg/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, webp, svg)"));
  }
};

export const upload = multer({
  storage: multer.memoryStorage(), // store in memory (no disk) — required for Vercel serverless
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});