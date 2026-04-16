import { Router, Request, Response, NextFunction } from "express";
import { upload } from "../../middleware/upload";
import { AppError } from "../../middleware/errorHandler";
import {
  addWatermark,
  encryptPdf,
  decryptPdf,
} from "../../services/pdfService";
import { cleanupFiles, generateFilename, validateTempFilePath } from "../../utils/fileUtils";
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

    const body = req.body as Record<string, unknown>;
    const password = typeof body.password === "string" ? body.password : "";
    const ownerPassword =
      typeof body.ownerPassword === "string" ? body.ownerPassword : password;
    const rawKeyLength = typeof body.keyLength === "string" ? parseInt(body.keyLength, 10) : 256;
    const keyLength = ([40, 128, 256].includes(rawKeyLength) ? rawKeyLength : 256) as
      | 40
      | 128
      | 256;

    if (!password) {
      cleanupFiles(file.path);
      return next(new AppError(400, "password is required"));
    }

    try {
      const safePath = validateTempFilePath(file.path);
      const buffer = fs.readFileSync(safePath);
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

    const body = req.body as Record<string, unknown>;
    const password = typeof body.password === "string" ? body.password : "";

    try {
      const safePath = validateTempFilePath(file.path);
      const buffer = fs.readFileSync(safePath);
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

    const body = req.body as Record<string, unknown>;
    const text = typeof body.text === "string" ? body.text : "WATERMARK";
    const fontSize = parseInt(typeof body.fontSize === "string" ? body.fontSize : "50", 10);
    const opacity = parseFloat(typeof body.opacity === "string" ? body.opacity : "0.3");
    const rotation = parseInt(typeof body.rotation === "string" ? body.rotation : "45", 10);

    try {
      const safePath = validateTempFilePath(file.path);
      const buffer = fs.readFileSync(safePath);
      const result = await addWatermark(buffer, {
        text,
        fontSize: isNaN(fontSize) ? 50 : fontSize,
        opacity: isNaN(opacity) ? 0.3 : opacity,
        rotation: isNaN(rotation) ? 45 : rotation,
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
