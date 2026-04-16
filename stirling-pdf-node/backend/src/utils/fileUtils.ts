import fs from "fs";
import path from "path";

/**
 * Delete a file or array of files, ignoring errors.
 */
export function cleanupFiles(
  ...filePaths: (string | undefined | null)[]
): void {
  for (const fp of filePaths) {
    if (fp) {
      try {
        fs.unlinkSync(fp);
      } catch {
        // ignore
      }
    }
  }
}

/**
 * Generate an output filename like `original_suffix.ext`.
 */
export function generateFilename(
  original: string | undefined,
  suffix: string
): string {
  const base = original ? path.basename(original, path.extname(original)) : "output";
  const ext = original ? path.extname(original) : ".pdf";
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
