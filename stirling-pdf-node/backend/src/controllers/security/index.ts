import { Router, Request, Response, NextFunction } from "express";
import { upload } from "../../middleware/upload";
import { AppError } from "../../middleware/errorHandler";
import {
  addWatermark,
  getMetadata,
  encryptPdf,
  decryptPdf,
} from "../../services/pdfService";
import { cleanupFiles, generateFilename } from "../../utils/fileUtils";
import fs from "fs";

export const securityRouter = Router();

// ---------------------------------------------------------------------------
// POST /api/v1/security/add-password
// Body: fileInput (PDF), password, ownerPassword, keyLength (40|128|256)
// ---------------------------------------------------------------------------
securityRouter.post(
  "/add-password",
  upload.single("fileInput"),
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) return next(new AppError(400, "fileInput is required"));

    const body = req.body as Record<string, string>;
    const password = body.password ?? "";
    const ownerPassword = body.ownerPassword ?? password;
    const keyLength = parseInt(body.keyLength ?? "256", 10) as 40 | 128 | 256;

    if (!password) {
      cleanupFiles(file.path);
      return next(new AppError(400, "password is required"));
    }

    try {
      const buffer = fs.readFileSync(file.path);
      const result = await encryptPdf(buffer, password, ownerPassword, keyLength);
      const filename = generateFilename(file.originalname, "_encrypted");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(result);
    } finally {
      cleanupFiles(file.path);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/v1/security/remove-password
// Body: fileInput (PDF), password
// ---------------------------------------------------------------------------
securityRouter.post(
  "/remove-password",
  upload.single("fileInput"),
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) return next(new AppError(400, "fileInput is required"));

    const body = req.body as Record<string, string>;
    const password = body.password ?? "";

    try {
      const buffer = fs.readFileSync(file.path);
      const result = await decryptPdf(buffer, password);
      const filename = generateFilename(file.originalname, "_decrypted");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(result);
    } finally {
      cleanupFiles(file.path);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/v1/security/add-watermark
// Body: fileInput (PDF), text, fontSize, opacity, rotation
// ---------------------------------------------------------------------------
securityRouter.post(
  "/add-watermark",
  upload.single("fileInput"),
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) return next(new AppError(400, "fileInput is required"));

    const body = req.body as Record<string, string>;
    const text = body.text ?? "WATERMARK";
    const fontSize = parseInt(body.fontSize ?? "50", 10);
    const opacity = parseFloat(body.opacity ?? "0.3");
    const rotation = parseInt(body.rotation ?? "45", 10);

    try {
      const buffer = fs.readFileSync(file.path);
      const result = await addWatermark(buffer, {
        text,
        fontSize,
        opacity,
        rotation,
      });
      const filename = generateFilename(file.originalname, "_watermarked");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(result);
    } finally {
      cleanupFiles(file.path);
    }
  }
);
