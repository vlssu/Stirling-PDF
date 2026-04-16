import {
  PDFDocument,
  degrees,
  rgb,
  StandardFonts,
  PDFName,
  PDFString,
  PDFHexString,
} from "pdf-lib";
import sharp from "sharp";
import fs from "fs";

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

/**
 * Merge multiple PDF buffers into a single PDF buffer.
 */
export async function mergePdfs(buffers: Buffer[]): Promise<Buffer> {
  const merged = await PDFDocument.create();
  for (const buf of buffers) {
    const doc = await PDFDocument.load(buf);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }
  return Buffer.from(await merged.save());
}

// ---------------------------------------------------------------------------
// Split
// ---------------------------------------------------------------------------

/**
 * Split a PDF buffer into individual pages, returning a Buffer per page.
 */
export async function splitPdf(
  buffer: Buffer,
  pageIndices?: number[]
): Promise<Buffer[]> {
  const src = await PDFDocument.load(buffer);
  const total = src.getPageCount();
  const indices =
    pageIndices ?? Array.from({ length: total }, (_, i) => i);

  const results: Buffer[] = [];
  for (const idx of indices) {
    if (idx < 0 || idx >= total) continue;
    const single = await PDFDocument.create();
    const [page] = await single.copyPages(src, [idx]);
    single.addPage(page);
    results.push(Buffer.from(await single.save()));
  }
  return results;
}

// ---------------------------------------------------------------------------
// Rotate
// ---------------------------------------------------------------------------

/**
 * Rotate all pages by the given angle (must be a multiple of 90).
 */
export async function rotatePdf(
  buffer: Buffer,
  angle: number
): Promise<Buffer> {
  if (angle % 90 !== 0) {
    throw new Error("Angle must be a multiple of 90");
  }
  const doc = await PDFDocument.load(buffer);
  for (const page of doc.getPages()) {
    page.setRotation(degrees((page.getRotation().angle + angle) % 360));
  }
  return Buffer.from(await doc.save());
}

// ---------------------------------------------------------------------------
// Remove pages
// ---------------------------------------------------------------------------

/**
 * Remove a set of 0-based page indices from a PDF.
 */
export async function removePagesFromPdf(
  buffer: Buffer,
  indicesToRemove: number[]
): Promise<Buffer> {
  const doc = await PDFDocument.load(buffer);
  const removeSet = new Set(indicesToRemove);
  const total = doc.getPageCount();
  // Remove in reverse order to avoid index shifting
  for (let i = total - 1; i >= 0; i--) {
    if (removeSet.has(i)) {
      doc.removePage(i);
    }
  }
  return Buffer.from(await doc.save());
}

// ---------------------------------------------------------------------------
// Extract pages
// ---------------------------------------------------------------------------

/**
 * Extract specific 0-based page indices from a PDF into a new PDF.
 */
export async function extractPages(
  buffer: Buffer,
  pageIndices: number[]
): Promise<Buffer> {
  const src = await PDFDocument.load(buffer);
  const dest = await PDFDocument.create();
  const pages = await dest.copyPages(src, pageIndices);
  pages.forEach((p) => dest.addPage(p));
  return Buffer.from(await dest.save());
}

// ---------------------------------------------------------------------------
// Watermark
// ---------------------------------------------------------------------------

export interface WatermarkOptions {
  text: string;
  fontSize?: number;
  opacity?: number;
  /** Rotation in degrees for the watermark text */
  rotation?: number;
  color?: { r: number; g: number; b: number };
}

/**
 * Add a text watermark to all pages of a PDF.
 */
export async function addWatermark(
  buffer: Buffer,
  opts: WatermarkOptions
): Promise<Buffer> {
  const {
    text,
    fontSize = 50,
    opacity = 0.3,
    rotation = 45,
    color = { r: 0.5, g: 0.5, b: 0.5 },
  } = opts;

  const doc = await PDFDocument.load(buffer);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate: degrees(rotation),
    });
  }

  return Buffer.from(await doc.save());
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  producer?: string;
  creator?: string;
}

/**
 * Read metadata from a PDF buffer.
 */
export async function getMetadata(buffer: Buffer): Promise<PdfMetadata> {
  const doc = await PDFDocument.load(buffer);
  return {
    title: doc.getTitle(),
    author: doc.getAuthor(),
    subject: doc.getSubject(),
    keywords: doc.getKeywords(),
    producer: doc.getProducer(),
    creator: doc.getCreator(),
  };
}

/**
 * Update metadata on a PDF and return the new buffer.
 */
export async function setMetadata(
  buffer: Buffer,
  meta: PdfMetadata
): Promise<Buffer> {
  const doc = await PDFDocument.load(buffer);
  if (meta.title !== undefined) doc.setTitle(meta.title);
  if (meta.author !== undefined) doc.setAuthor(meta.author);
  if (meta.subject !== undefined) doc.setSubject(meta.subject);
  if (meta.keywords !== undefined) doc.setKeywords([meta.keywords]);
  if (meta.producer !== undefined) doc.setProducer(meta.producer);
  if (meta.creator !== undefined) doc.setCreator(meta.creator);
  return Buffer.from(await doc.save());
}

// ---------------------------------------------------------------------------
// Images → PDF
// ---------------------------------------------------------------------------

/**
 * Convert image buffers (JPEG / PNG) to a PDF, one image per page.
 */
export async function imagesToPdf(
  images: { buffer: Buffer; mimetype: string }[]
): Promise<Buffer> {
  const doc = await PDFDocument.create();
  for (const img of images) {
    const isJpeg =
      img.mimetype === "image/jpeg" || img.mimetype === "image/jpg";

    // Convert to PNG via sharp if not jpeg/png
    let buf = img.buffer;
    let embedFn: typeof doc.embedJpg | typeof doc.embedPng;

    if (isJpeg) {
      embedFn = doc.embedJpg.bind(doc);
    } else {
      // Use sharp to convert to PNG if needed
      buf = await sharp(img.buffer).png().toBuffer();
      embedFn = doc.embedPng.bind(doc);
    }

    const embedded = await embedFn(buf);
    const page = doc.addPage([embedded.width, embedded.height]);
    page.drawImage(embedded, {
      x: 0,
      y: 0,
      width: embedded.width,
      height: embedded.height,
    });
  }
  return Buffer.from(await doc.save());
}

// ---------------------------------------------------------------------------
// PDF → Images
// ---------------------------------------------------------------------------
// NOTE: PDF→image rendering requires a native PDF renderer.
// We use an external CLI (pdftoppm / mutool) when available; otherwise return
// a placeholder explaining the limitation.  The endpoint provides a best-effort
// implementation that shells out to `pdftoppm` if present on the PATH.

import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import os from "os";

const execFileAsync = promisify(execFile);

/**
 * Convert a PDF buffer to PNG image buffers (one per page).
 * Requires `pdftoppm` (poppler-utils) to be installed on the host.
 */
export async function pdfToImages(
  buffer: Buffer,
  dpi = 150
): Promise<Buffer[]> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "spdf-img-"));
  const inFile = path.join(tmpDir, "input.pdf");
  const outPrefix = path.join(tmpDir, "page");

  try {
    fs.writeFileSync(inFile, buffer);

    await execFileAsync("pdftoppm", [
      "-png",
      "-r",
      String(dpi),
      inFile,
      outPrefix,
    ]);

    const files = fs
      .readdirSync(tmpDir)
      .filter((f) => f.startsWith("page") && f.endsWith(".png"))
      .sort()
      .map((f) => path.join(tmpDir, f));

    return files.map((f) => fs.readFileSync(f));
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}

// ---------------------------------------------------------------------------
// Compress (via Ghostscript)
// ---------------------------------------------------------------------------

/**
 * Compress a PDF using Ghostscript.
 * Quality: "screen" | "ebook" | "printer" | "prepress" | "default"
 */
export async function compressPdf(
  buffer: Buffer,
  quality: "screen" | "ebook" | "printer" | "prepress" | "default" = "ebook"
): Promise<Buffer> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "spdf-compress-"));
  const inFile = path.join(tmpDir, "input.pdf");
  const outFile = path.join(tmpDir, "output.pdf");

  try {
    fs.writeFileSync(inFile, buffer);

    await execFileAsync("gs", [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      `-dPDFSETTINGS=/${quality}`,
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      `-sOutputFile=${outFile}`,
      inFile,
    ]);

    return fs.readFileSync(outFile);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

// ---------------------------------------------------------------------------
// Office → PDF (via LibreOffice)
// ---------------------------------------------------------------------------

/**
 * Convert an Office document (docx, xlsx, pptx…) to PDF using LibreOffice.
 */
export async function officeToPdf(
  buffer: Buffer,
  originalName: string
): Promise<Buffer> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "spdf-office-"));
  const inFile = path.join(tmpDir, originalName);

  try {
    fs.writeFileSync(inFile, buffer);

    await execFileAsync("libreoffice", [
      "--headless",
      "--convert-to",
      "pdf",
      "--outdir",
      tmpDir,
      inFile,
    ]);

    const baseName = path.basename(originalName, path.extname(originalName));
    const outFile = path.join(tmpDir, `${baseName}.pdf`);

    if (!fs.existsSync(outFile)) {
      throw new Error("LibreOffice conversion failed: output file not found");
    }

    return fs.readFileSync(outFile);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

// ---------------------------------------------------------------------------
// Encrypt / Decrypt  (pdf-lib does not support encryption natively; we use
// a light-weight approach: add a user-password using PDF standard encryption
// fields via qpdf CLI when available, or fall back to a note in the PDF body)
// ---------------------------------------------------------------------------

/**
 * Add password protection to a PDF using qpdf CLI.
 * If qpdf is unavailable, throws an informative error.
 */
export async function encryptPdf(
  buffer: Buffer,
  userPassword: string,
  ownerPassword: string,
  keyLength: 40 | 128 | 256 = 256
): Promise<Buffer> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "spdf-enc-"));
  const inFile = path.join(tmpDir, "input.pdf");
  const outFile = path.join(tmpDir, "output.pdf");

  try {
    fs.writeFileSync(inFile, buffer);

    await execFileAsync("qpdf", [
      `--encrypt`,
      userPassword,
      ownerPassword,
      String(keyLength),
      "--",
      inFile,
      outFile,
    ]);

    return fs.readFileSync(outFile);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

/**
 * Remove password protection from a PDF using qpdf CLI.
 */
export async function decryptPdf(
  buffer: Buffer,
  password: string
): Promise<Buffer> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "spdf-dec-"));
  const inFile = path.join(tmpDir, "input.pdf");
  const outFile = path.join(tmpDir, "output.pdf");

  try {
    fs.writeFileSync(inFile, buffer);

    await execFileAsync("qpdf", [
      `--password=${password}`,
      "--decrypt",
      inFile,
      outFile,
    ]);

    return fs.readFileSync(outFile);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}
