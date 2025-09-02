// backend/src/routes/documents.js
import { Router } from "express";
import { upload } from "../middleware/multer.js";
import cloudinary from "../config/cloudinary.js";
import Application from "../models/Application.js";
import { requireAuth } from "../middleware/auth.js";

const r = Router();

/**
 * Upload a single document for an application.
 * Accepts PDF/JPG/PNG.
 * - Images → stored under `image/upload`
 * - PDFs → stored under `raw/upload`
 */
r.post(
  "/:applicationId",
  requireAuth(["student", "admin"]),
  upload.single("file"),
  async (req, res) => {
    const { applicationId } = req.params;
    const { kind } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file" });
    }

    const okTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!okTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Only PDF/JPG/PNG allowed" });
    }

    try {
      const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString(
        "base64"
      )}`;

      // ⚡ Force PDFs into raw
      const resourceType =
        req.file.mimetype === "application/pdf" ? "raw" : "image";

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "admission-docs",
        resource_type: resourceType, // auto fix for PDFs
        type: "upload",
        overwrite: true,
        use_filename: true,
        unique_filename: true,
      });

      const app = await Application.findById(applicationId);
      if (!app) return res.status(404).json({ message: "Application not found" });

      app.documents.push({
        kind,
        url: result.secure_url, // ✅ store correct link
        status: "pending",
      });

      await app.save();
      return res.json({ url: result.secure_url });
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return res.status(500).json({ message: "Upload failed" });
    }
  }
);

export default r;
