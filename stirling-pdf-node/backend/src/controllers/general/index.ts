import { Router, Request, Response, NextFunction } from "express";
import archiver from "archiver";
import { PDFDocument } from "pdf-lib";
import { upload } from "../../middleware/upload";
import { AppError } from "../../middleware/errorHandler";
import {
  mergePdfs,
  splitPdf,
  rotatePdf,
  removePagesFromPdf,
  extractPages,
} from "../../services/pdfService";
import {
  cleanupFiles,
  generateFilename,
  parsePageNumbers,
  validateTempFilePath,
} from "../../utils/fileUtils";
import fs from "fs";
import path from "path";
import os from "os";

export const generalRouter = Router();

// ---------------------------------------------------------------------------
// POST /api/v1/general/merge-pdfs
// Body (multipart): fileInput[] — multiple PDF files
// ---------------------------------------------------------------------------
generalRouter.post(
  "/merge-pdfs",
  upload.array("fileInput", 50),
  async (req: Request, res: Response, next: NextFunction) => {
    const files = Array.isArray(req.files) ? (req.files as Express.Multer.File[]) : [];
    if (files.length < 2) {
      return next(new AppError(400, "At least two PDF files are required"));
    }

    try {
      const buffers = files.map((f) => fs.readFileSync(validateTempFilePath(f.path)));
      const merged = await mergePdfs(buffers);
      const filename = generateFilename(files[0].originalname, "_merged");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(merged);
    } finally {
      cleanupFiles(...files.map((f) => f.path));
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/v1/general/split-pages
// Body (multipart): fileInput (single PDF), pageNumbers (e.g. "1,3,5-7")
// ---------------------------------------------------------------------------
generalRouter.post(
  "/split-pages",
  upload.single("fileInput"),
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) return next(new AppError(400, "fileInput is required"));

    try {
      const safePath = validateTempFilePath(file.path);
      const buffer = fs.readFileSync(safePath);
      const src = await PDFDocument.load(buffer);
      const totalPages = src.getPageCount();
      const body = req.body as Record<string, unknown>;
      const pageSpec = typeof body.pageNumbers === "string" ? body.pageNumbers : "all";
      const indices = parsePageNumbers(pageSpec, totalPages);

      const pages = await splitPdf(buffer, indices);

      const zipPath = path.join(os.tmpdir(), `spdf-split-${Date.now()}.zip`);
      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 6 } });

      await new Promise<void>((resolve, reject) => {
        output.on("close", resolve);
        archive.on("error", reject);
        archive.pipe(output);

        const baseName = path.basename(file.originalname, ".pdf");
        pages.forEach((buf, i) => {
          archive.append(buf, { name: `${baseName}_page${i + 1}.pdf` });
        });

        archive.finalize();
      });

      const zipBuffer = fs.readFileSync(zipPath);
      cleanupFiles(zipPath);

      const zipFilename = generateFilename(file.originalname, "_split").replace(".pdf", ".zip");
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${zipFilename}"`);
      res.send(zipBuffer);
    } finally {
      cleanupFiles(file.path);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/v1/general/rotate-pdf
// Body (multipart): fileInput (single PDF), angle (number, multiple of 90)
// ---------------------------------------------------------------------------
generalRouter.post(
  "/rotate-pdf",
  upload.single("fileInput"),
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) return next(new AppError(400, "fileInput is required"));

    const body = req.body as Record<string, unknown>;
    const angleStr = typeof body.angle === "string" ? body.angle : "90";
    const angle = parseInt(angleStr, 10);
    if (isNaN(angle) || angle % 90 !== 0) {
      cleanupFiles(file.path);
      return next(new AppError(400, "angle must be a multiple of 90"));
    }

    try {
      const safePath = validateTempFilePath(file.path);
      const buffer = fs.readFileSync(safePath);
      const rotated = await rotatePdf(buffer, angle);
      const filename = generateFilename(file.originalname, "_rotated");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(rotated);
    } finally {
      cleanupFiles(file.path);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/v1/general/remove-pages
// Body (multipart): fileInput (single PDF), pageNumbers ("1,3,5")
// ---------------------------------------------------------------------------
generalRouter.post(
  "/remove-pages",
  upload.single("fileInput"),
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) return next(new AppError(400, "fileInput is required"));

    try {
      const safePath = validateTempFilePath(file.path);
      const buffer = fs.readFileSync(safePath);
      const src = await PDFDocument.load(buffer);
      const totalPages = src.getPageCount();

      const body = req.body as Record<string, unknown>;
      const pageSpec = typeof body.pageNumbers === "string" ? body.pageNumbers : "";
      if (!pageSpec) {
        return next(new AppError(400, "pageNumbers is required"));
      }

      const indices = parsePageNumbers(pageSpec, totalPages);
      const result = await removePagesFromPdf(buffer, indices);
      const filename = generateFilename(file.originalname, "_pages_removed");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(result);
    } finally {
      cleanupFiles(file.path);
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/v1/general/extract-pages
// Body (multipart): fileInput (single PDF), pageNumbers ("1,3,5-7")
// ---------------------------------------------------------------------------
generalRouter.post(
  "/extract-pages",
  upload.single("fileInput"),
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) return next(new AppError(400, "fileInput is required"));

    try {
      const safePath = validateTempFilePath(file.path);
      const buffer = fs.readFileSync(safePath);
      const src = await PDFDocument.load(buffer);
      const totalPages = src.getPageCount();

      const body = req.body as Record<string, unknown>;
      const pageSpec = typeof body.pageNumbers === "string" ? body.pageNumbers : "all";
      const indices = parsePageNumbers(pageSpec, totalPages);
      const result = await extractPages(buffer, indices);
      const filename = generateFilename(file.originalname, "_extracted");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(result);
    } finally {
      cleanupFiles(file.path);
    }
  }
);
