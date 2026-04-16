import type { ToolDefinition } from "@/types/tool";

export const TOOLS: ToolDefinition[] = [
  // ── General ────────────────────────────────────────────────────────────────
  {
    id: "merge",
    name: "Merge PDF",
    description: "Combine multiple PDF files into one document",
    icon: "Files",
    category: "general",
    endpoint: "/general/merge-pdfs",
    multiFile: true,
  },
  {
    id: "split",
    name: "Split PDF",
    description: "Split a PDF into separate pages or page ranges",
    icon: "Scissor",
    category: "general",
    endpoint: "/general/split-pages",
  },
  {
    id: "rotate",
    name: "Rotate PDF",
    description: "Rotate pages in a PDF by 90, 180, or 270 degrees",
    icon: "Refresh",
    category: "general",
    endpoint: "/general/rotate-pdf",
  },
  {
    id: "extractPages",
    name: "Extract Pages",
    description: "Extract specific pages from a PDF into a new file",
    icon: "Document",
    category: "general",
    endpoint: "/general/extract-pages",
  },
  {
    id: "removePages",
    name: "Remove Pages",
    description: "Remove specific pages from a PDF",
    icon: "Delete",
    category: "general",
    endpoint: "/general/remove-pages",
  },
  // ── Security ───────────────────────────────────────────────────────────────
  {
    id: "addPassword",
    name: "Add Password",
    description: "Protect a PDF with a password",
    icon: "Lock",
    category: "security",
    endpoint: "/security/add-password",
  },
  {
    id: "removePassword",
    name: "Remove Password",
    description: "Remove password protection from a PDF",
    icon: "Unlock",
    category: "security",
    endpoint: "/security/remove-password",
  },
  {
    id: "watermark",
    name: "Add Watermark",
    description: "Add a text watermark to all pages",
    icon: "Edit",
    category: "security",
    endpoint: "/security/add-watermark",
  },
  // ── Misc ───────────────────────────────────────────────────────────────────
  {
    id: "compress",
    name: "Compress PDF",
    description: "Reduce the file size of a PDF using Ghostscript",
    icon: "Fold",
    category: "misc",
    endpoint: "/misc/compress-pdf",
  },
  {
    id: "metadata",
    name: "Edit Metadata",
    description: "View and update the metadata of a PDF",
    icon: "InfoFilled",
    category: "misc",
    endpoint: "/misc/update-metadata",
  },
  // ── Convert ────────────────────────────────────────────────────────────────
  {
    id: "imageToPdf",
    name: "Images to PDF",
    description: "Convert images (JPEG/PNG) to a PDF document",
    icon: "Picture",
    category: "convert",
    endpoint: "/convert/img/pdf",
    multiFile: true,
  },
  {
    id: "pdfToImage",
    name: "PDF to Images",
    description: "Convert PDF pages to PNG images",
    icon: "PictureFilled",
    category: "convert",
    endpoint: "/convert/pdf/img",
  },
  {
    id: "officeToPdf",
    name: "Office to PDF",
    description: "Convert Word / Excel / PowerPoint files to PDF",
    icon: "CopyDocument",
    category: "convert",
    endpoint: "/convert/office/pdf",
  },
];

export const TOOL_CATEGORIES: Record<string, string> = {
  general: "General",
  security: "Security",
  convert: "Convert",
  misc: "Miscellaneous",
};
