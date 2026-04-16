import { Router, Request, Response, NextFunction } from "express";
import { upload } from "../../middleware/upload";
import { AppError } from "../../middleware/errorHandler";
import {
  getMetadata,
  setMetadata,
  compressPdf,
} from "../../services/pdfService";
import { cleanupFiles, generateFilename } from "../../utils/fileUtils";
import fs from "fs";

export const miscRouter = Router();

// ---------------------------------------------------------------------------
// GET /api/v1/misc/get-metadata
// Body: fileInput (PDF)
// ---------------------------------------------------------------------------
miscRouter.post(
  "/get-metadata",
  upload.single("fileInput"),
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) return next(new AppError(400, "fileInput is required"));

    try {
      const buffer = fs.readFileSync(file.path);
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

    const body = req.body as Record<string, string>;

    try {
      const buffer = fs.readFileSync(file.path);
      const result = await setMetadata(buffer, {
        title: body.title,
        author: body.author,
        subject: body.subject,
        keywords: body.keywords,
        producer: body.producer,
        creator: body.creator,
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

    const body = req.body as Record<string, string>;
    const quality = (body.quality ?? "ebook") as
      | "screen"
      | "ebook"
      | "printer"
      | "prepress"
      | "default";

    try {
      const buffer = fs.readFileSync(file.path);
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
