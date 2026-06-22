/**
 * upload-video.ts — Video Upload Handler
 * Handles video file uploads to S3 storage
 */
import { Express, Response } from "express";
import { storagePut } from "./storage";
import multer from "multer";
import type { Request } from "express";

// Configure multer for video uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const validMimes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (validMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("صيغة الفيديو غير مدعومة"));
    }
  },
});

export function setupVideoUploadRoute(app: Express) {
  app.post("/api/upload-video", upload.single("file"), async (req: any, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "لا يوجد ملف" });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const ext = req.file.originalname.split(".").pop() || "mp4";
      const filename = `video-${timestamp}-${random}.${ext}`;

      // Upload to S3
      const { url } = await storagePut(
        `videos/${filename}`,
        req.file.buffer,
        req.file.mimetype
      );

      return res.json({ url });
    } catch (error) {
      console.error("Video upload error:", error);
      return res.status(500).json({ error: "خطأ في رفع الفيديو" });
    }
  });
}
