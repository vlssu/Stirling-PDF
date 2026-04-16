import { Router, Request, Response, NextFunction } from "express";
import { upload } from "../../middleware/upload";
import { AppError } from "../../middleware/errorHandler";
import {
  getMetadata,
  setMetadata,
  compressPdf,
} from "../../services/pdfService";
import { cleanupFiles, generateFilename, validateTempFilePath } from "../../utils/fileUtils";
import fs from "fs";

export const miscRouter = Router();

// ---------------------------------------------------------------------------
// POST /api/v1/misc/get-metadata
// Body: fileInput (PDF)
// ---------------------------------------------------------------------------
miscRouter.post(
  "/get-metadata",
  upload.single("fileInput"),
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) return next(new AppError(400, "fileInput is required"));

    try {
      const safePath = validateTempFilePath(file.path);
      const buffer = fs.readFileSync(safePath);
      const meta = await getMetadata(buffer);
      res.json(meta);
    } finally {
      cleanupFiles(file.path);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/v1/misc/update-metadata
// Body: fileInput (PDF), title, author, subject, keywords, producer, creator
// ---------------------------------------------------------------------------
miscRouter.post(
  "/update-metadata",
  upload.single("fileInput"),
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) return next(new AppError(400, "fileInput is required"));

    const body = req.body as Record<string, unknown>;
    const str = (key: string) =>
      typeof body[key] === "string" ? (body[key] as string) : undefined;

    try {
      const safePath = validateTempFilePath(file.path);
      const buffer = fs.readFileSync(safePath);
      const result = await setMetadata(buffer, {
        title: str("title"),
        author: str("author"),
        subject: str("subject"),
        keywords: str("keywords"),
        producer: str("producer"),
        creator: str("creator"),
      });
      const filename = generateFilename(file.originalname, "_metadata");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(result);
    } finally {
      cleanupFiles(file.path);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/v1/misc/compress-pdf
// Body: fileInput (PDF), quality (screen|ebook|printer|prepress|default)
// ---------------------------------------------------------------------------
miscRouter.post(
  "/compress-pdf",
  upload.single("fileInput"),
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) return next(new AppError(400, "fileInput is required"));

    const body = req.body as Record<string, unknown>;
    const allowedQuality = ["screen", "ebook", "printer", "prepress", "default"] as const;
    type Quality = (typeof allowedQuality)[number];
    const raw = typeof body.quality === "string" ? body.quality : "ebook";
    const quality: Quality = allowedQuality.includes(raw as Quality)
      ? (raw as Quality)
      : "ebook";

    try {
      const safePath = validateTempFilePath(file.path);
      const buffer = fs.readFileSync(safePath);
      const result = await compressPdf(buffer, quality);
      const filename = generateFilename(file.originalname, "_compressed");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(result);
    } finally {
      cleanupFiles(file.path);
    }
  }
);
