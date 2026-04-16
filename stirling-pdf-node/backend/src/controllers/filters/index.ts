import { Router, Request, Response, NextFunction } from "express";
import { PDFDocument } from "pdf-lib";
import { upload } from "../../middleware/upload";
import { AppError } from "../../middleware/errorHandler";
import { cleanupFiles, validateTempFilePath } from "../../utils/fileUtils";
import fs from "fs";

export const filtersRouter = Router();

// ---------------------------------------------------------------------------
// POST /api/v1/filter/blank-pages
// Returns structural page info; pixel-level blank detection requires pdftoppm.
// Body: fileInput (PDF)
// ---------------------------------------------------------------------------
filtersRouter.post(
  "/blank-pages",
  upload.single("fileInput"),
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) return next(new AppError(400, "fileInput is required"));

    try {
      const safePath = validateTempFilePath(file.path);
      const buffer = fs.readFileSync(safePath);
      const doc = await PDFDocument.load(buffer);
      const pageCount = doc.getPageCount();

      const analysis = doc.getPages().map((page, i) => {
        const { width, height } = page.getSize();
        return { pageIndex: i, pageNumber: i + 1, width, height };
      });

      res.json({
        totalPages: pageCount,
        pages: analysis,
        note: "Full blank-page pixel analysis requires pdftoppm to be installed.",
      });
    } finally {
      cleanupFiles(file.path);
    }
  }
);
