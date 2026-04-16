import { Router, Request, Response, NextFunction } from "express";
import { upload } from "../../middleware/upload";
import { AppError } from "../../middleware/errorHandler";
import {
  imagesToPdf,
  pdfToImages,
  officeToPdf,
} from "../../services/pdfService";
import { cleanupFiles, generateFilename, validateTempFilePath } from "../../utils/fileUtils";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import os from "os";

export const convertersRouter = Router();

// ---------------------------------------------------------------------------
// POST /api/v1/convert/img/pdf
// Body: fileInput[] (images: JPEG/PNG/etc.)
// ---------------------------------------------------------------------------
convertersRouter.post(
  "/img/pdf",
  upload.array("fileInput", 50),
  async (req: Request, res: Response, next: NextFunction) => {
    const files = Array.isArray(req.files) ? (req.files as Express.Multer.File[]) : [];
    if (files.length === 0) {
      return next(new AppError(400, "At least one image file is required"));
    }

    try {
      const images = files.map((f) => ({
        buffer: fs.readFileSync(validateTempFilePath(f.path)),
        mimetype: f.mimetype,
      }));

      const pdfBuffer = await imagesToPdf(images);
      const filename = generateFilename(files[0].originalname, "_converted").replace(
        path.extname(files[0].originalname),
        ".pdf"
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } finally {
      cleanupFiles(...files.map((f) => f.path));
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/v1/convert/pdf/img
// Body: fileInput (PDF), dpi (optional, default 150)
// ---------------------------------------------------------------------------
convertersRouter.post(
  "/pdf/img",
  upload.single("fileInput"),
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) return next(new AppError(400, "fileInput is required"));

    const body = req.body as Record<string, unknown>;
    const rawDpi = typeof body.dpi === "string" ? parseInt(body.dpi, 10) : 150;
    const dpi = isNaN(rawDpi) || rawDpi <= 0 ? 150 : Math.min(rawDpi, 600);

    try {
      const safePath = validateTempFilePath(file.path);
      const buffer = fs.readFileSync(safePath);
      const images = await pdfToImages(buffer, dpi);

      if (images.length === 1) {
        const filename = generateFilename(file.originalname, "_page1").replace(".pdf", ".png");
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.send(images[0]);
      } else {
        const zipPath = path.join(os.tmpdir(), `spdf-imgs-${Date.now()}.zip`);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", { zlib: { level: 6 } });

        await new Promise<void>((resolve, reject) => {
          output.on("close", resolve);
          archive.on("error", reject);
          archive.pipe(output);

          const baseName = path.basename(file.originalname, ".pdf");
          images.forEach((img, i) => {
            archive.append(img, { name: `${baseName}_page${i + 1}.png` });
          });

          archive.finalize();
        });

        const zipBuffer = fs.readFileSync(zipPath);
        cleanupFiles(zipPath);

        const zipFilename = generateFilename(file.originalname, "_images").replace(".pdf", ".zip");
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename="${zipFilename}"`);
        res.send(zipBuffer);
      }
    } finally {
      cleanupFiles(file.path);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/v1/convert/office/pdf
// Body: fileInput (Office document)
// ---------------------------------------------------------------------------
convertersRouter.post(
  "/office/pdf",
  upload.single("fileInput"),
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) return next(new AppError(400, "fileInput is required"));

    try {
      const safePath = validateTempFilePath(file.path);
      const buffer = fs.readFileSync(safePath);
      // Use only the basename to avoid path traversal in the CLI call
      const safeName = path.basename(file.originalname);
      const pdfBuffer = await officeToPdf(buffer, safeName);
      const filename = generateFilename(
        path.basename(file.originalname, path.extname(file.originalname)) + ".pdf",
        "_converted"
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(pdfBuffer);
    } finally {
      cleanupFiles(file.path);
    }
  }
);
