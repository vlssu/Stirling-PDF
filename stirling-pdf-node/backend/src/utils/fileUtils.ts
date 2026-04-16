import fs from "fs";
import path from "path";
import os from "os";

/**
 * Delete a file or array of files, ignoring errors.
 * Only deletes files that reside inside the OS temp directory to prevent
 * accidental deletion of arbitrary paths.
 */
export function cleanupFiles(
  ...filePaths: (string | undefined | null)[]
): void {
  const tmpDir = os.tmpdir();
  for (const fp of filePaths) {
    if (!fp) continue;
    // Security: only delete files within the temp directory
    const resolved = path.resolve(fp);
    if (!resolved.startsWith(tmpDir + path.sep) && resolved !== tmpDir) {
      continue;
    }
    try {
      fs.unlinkSync(resolved);
    } catch {
      // ignore
    }
  }
}

/**
 * Sanitize a user-supplied filename so it cannot traverse directories or
 * contain dangerous characters.
 */
function sanitizeBasename(name: string): string {
  // Strip any directory components, then replace dangerous chars
  const base = path.basename(name).replace(/[^a-zA-Z0-9_\-. ]/g, "_");
  return base || "output";
}

/**
 * Generate an output filename like `original_suffix.ext`.
 * The original filename is sanitized to prevent path-injection.
 */
export function generateFilename(
  original: string | undefined,
  suffix: string
): string {
  const safe = sanitizeBasename(original ?? "output.pdf");
  const base = safe.substring(0, safe.lastIndexOf(".")) || safe;
  const ext = safe.includes(".") ? safe.substring(safe.lastIndexOf(".")) : ".pdf";
  return `${base}${suffix}${ext}`;
}

/**
 * Parse a comma/range page-numbers string (1-based, "all" = all pages).
 * Returns a sorted unique array of 0-based page indices.
 */
export function parsePageNumbers(spec: string, totalPages: number): number[] {
  if (!spec || spec.trim().toLowerCase() === "all") {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const indices = new Set<number>();
  for (const part of spec.split(",")) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          const idx = i - 1;
          if (idx >= 0 && idx < totalPages) indices.add(idx);
        }
      }
    } else {
      const n = parseInt(trimmed, 10);
      if (!isNaN(n)) {
        const idx = n - 1;
        if (idx >= 0 && idx < totalPages) indices.add(idx);
      }
    }
  }

  return [...indices].sort((a, b) => a - b);
}

/**
 * Validate that a multer-uploaded file path resides within the OS temp
 * directory. Throws if the path is outside the expected location.
 */
export function validateTempFilePath(filePath: string): string {
  const tmpDir = os.tmpdir();
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(tmpDir + path.sep) && resolved !== tmpDir) {
    throw new Error("Invalid file path: file is not in the temp directory");
  }
  return resolved;
}
