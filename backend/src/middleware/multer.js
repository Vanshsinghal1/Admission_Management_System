import multer from 'multer';

// 10 MB; memory storage so we can send Buffer to Cloudinary
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
