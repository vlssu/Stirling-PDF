# Stirling PDF — Node.js Edition

A **Node.js port** of [Stirling-PDF](https://github.com/Stirling-Tools/Stirling-PDF), built with:

| Layer | Technology |
|-------|-----------|
| **Backend** | [Express 5](https://expressjs.com/) + TypeScript |
| **Frontend** | [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/) + TypeScript |
| **HTTP client** | Native `fetch` (no axios) |
| **UI library** | [Element Plus](https://element-plus.org/) |
| **State management** | [Pinia](https://pinia.vuejs.org/) |
| **PDF processing** | [pdf-lib](https://pdf-lib.js.org/) |
| **File uploads** | [multer](https://github.com/expressjs/multer) |

---

## Features

| Tool | API Endpoint |
|------|-------------|
| Merge PDFs | `POST /api/v1/general/merge-pdfs` |
| Split PDF | `POST /api/v1/general/split-pages` |
| Rotate PDF | `POST /api/v1/general/rotate-pdf` |
| Extract Pages | `POST /api/v1/general/extract-pages` |
| Remove Pages | `POST /api/v1/general/remove-pages` |
| Add Password | `POST /api/v1/security/add-password` |
| Remove Password | `POST /api/v1/security/remove-password` |
| Add Watermark | `POST /api/v1/security/add-watermark` |
| Compress PDF | `POST /api/v1/misc/compress-pdf` |
| Get / Update Metadata | `POST /api/v1/misc/get-metadata`, `POST /api/v1/misc/update-metadata` |
| Images → PDF | `POST /api/v1/convert/img/pdf` |
| PDF → Images | `POST /api/v1/convert/pdf/img` |
| Office → PDF | `POST /api/v1/convert/office/pdf` |
| Blank-page analysis | `POST /api/v1/filter/blank-pages` |

---

## Directory Structure

```
stirling-pdf-node/
├── backend/                   # Express + TypeScript
│   ├── src/
│   │   ├── app.ts             # Entry point
│   │   ├── controllers/
│   │   │   ├── general/       # merge, split, rotate, extract, remove pages
│   │   │   ├── security/      # password, watermark
│   │   │   ├── misc/          # metadata, compress
│   │   │   ├── converters/    # image↔PDF, office→PDF
│   │   │   └── filters/       # blank-page analysis
│   │   ├── services/
│   │   │   └── pdfService.ts  # Core PDF operations (pdf-lib + CLI)
│   │   ├── middleware/
│   │   │   ├── upload.ts      # multer configuration
│   │   │   └── errorHandler.ts
│   │   └── utils/
│   │       └── fileUtils.ts   # filename helpers, page-number parser
│   ├── tsconfig.json
│   └── package.json
│
└── frontend/                  # Vue 3 + TypeScript
    ├── src/
    │   ├── main.ts
    │   ├── App.vue
    │   ├── api/
    │   │   └── client.ts      # fetch-only API layer
    │   ├── composables/
    │   │   └── useToolOperation.ts  # Unified hook for all tools
    │   ├── stores/
    │   │   └── files.ts       # Pinia file store
    │   ├── router/
    │   │   └── index.ts
    │   ├── data/
    │   │   └── tools.ts       # Tool registry
    │   ├── types/
    │   │   └── tool.ts
    │   ├── components/
    │   │   ├── layout/        # AppLayout, AppNavbar, AppSidebar
    │   │   ├── shared/        # FileUploader, DownloadButton, ToolShell
    │   │   └── tools/         # One component per PDF tool
    │   └── views/
    │       ├── HomeView.vue   # Tool picker grid
    │       └── ToolView.vue   # Dynamic tool renderer
    ├── vite.config.ts
    └── package.json
```

---

## Prerequisites

| Dependency | Version | Required for |
|-----------|---------|-------------|
| **Node.js** | ≥ 18.0.0 | All features |
| **npm** | ≥ 7.0.0 | Workspace support (or use pnpm / yarn v1) |
| **Ghostscript (`gs`)** | any | Compress PDF |
| **qpdf** | any | Add / Remove password |
| **LibreOffice** | any | Office → PDF conversion |
| **poppler-utils (`pdftoppm`)** | any | PDF → Image conversion |

---

## Quick Start

### Installation

```bash
cd stirling-pdf-node

# npm (v7 or later required for workspace support)
npm install

# pnpm
pnpm install

# yarn (v1)
yarn install
```

### Development

Run each workspace in a separate terminal:

```bash
# Terminal 1 — Backend (port 3001)
# npm
cd backend && npm run dev
# pnpm
cd backend && pnpm run dev
# yarn
cd backend && yarn dev

# Terminal 2 — Frontend (port 5173, proxies /api/* → 3001)
# npm
cd frontend && npm run dev
# pnpm
cd frontend && pnpm run dev
# yarn
cd frontend && yarn dev
```

Or use the workspace-level shortcuts from the monorepo root:

```bash
# npm workspace shortcuts
npm run dev:backend   # start backend
npm run dev:frontend  # start frontend
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
# Build the Vue SPA (from frontend/)
npm run build         # or: pnpm build / yarn build

# Compile backend TypeScript (from backend/)
npm run build         # or: pnpm build / yarn build

# Start the production server — serves the Vue SPA + API
node dist/app.js
```

The backend serves the Vue SPA at `/` and exposes all API routes at `/api/v1/...`.

---

## API Reference

All endpoints accept `multipart/form-data` with `fileInput` as the file field name.

### Merge PDFs
```
POST /api/v1/general/merge-pdfs
Fields: fileInput[] (2+ PDF files)
Returns: application/pdf
```

### Split PDF
```
POST /api/v1/general/split-pages
Fields: fileInput (PDF), pageNumbers (optional, e.g. "1,3,5-7")
Returns: application/zip
```

### Rotate PDF
```
POST /api/v1/general/rotate-pdf
Fields: fileInput (PDF), angle (90 | 180 | 270)
Returns: application/pdf
```

### Add Password
```
POST /api/v1/security/add-password
Fields: fileInput (PDF), password, ownerPassword (optional), keyLength (40|128|256)
Returns: application/pdf
Requires: qpdf
```

### Remove Password
```
POST /api/v1/security/remove-password
Fields: fileInput (PDF), password
Returns: application/pdf
Requires: qpdf
```

### Add Watermark
```
POST /api/v1/security/add-watermark
Fields: fileInput (PDF), text, fontSize (default 50), opacity (default 0.3), rotation (default 45)
Returns: application/pdf
```

### Compress PDF
```
POST /api/v1/misc/compress-pdf
Fields: fileInput (PDF), quality (screen|ebook|printer|prepress|default)
Returns: application/pdf
Requires: Ghostscript (gs)
```

### Get Metadata
```
POST /api/v1/misc/get-metadata
Fields: fileInput (PDF)
Returns: application/json { title, author, subject, keywords, producer, creator }
```

### Update Metadata
```
POST /api/v1/misc/update-metadata
Fields: fileInput (PDF), title, author, subject, keywords, producer, creator
Returns: application/pdf
```

### Images → PDF
```
POST /api/v1/convert/img/pdf
Fields: fileInput[] (JPEG/PNG images)
Returns: application/pdf
```

### PDF → Images
```
POST /api/v1/convert/pdf/img
Fields: fileInput (PDF), dpi (72|150|300, default 150)
Returns: image/png (single page) | application/zip (multiple pages)
Requires: pdftoppm (poppler-utils)
```

### Office → PDF
```
POST /api/v1/convert/office/pdf
Fields: fileInput (Office document)
Returns: application/pdf
Requires: LibreOffice
```

---

## Architecture Notes

### fetch-only HTTP client

All frontend HTTP requests use native `fetch` — no axios dependency.
See `frontend/src/api/client.ts`:

```typescript
export async function uploadFiles(
  endpoint: string,
  files: File | File[],
  params: Record<string, string | number | boolean> = {}
): Promise<Blob> {
  const formData = new FormData();
  // ... build form data ...
  const response = await fetch(`/api/v1${endpoint}`, { method: "POST", body: formData });
  if (!response.ok) throw new Error(/* ... */);
  return response.blob();
}
```

### useToolOperation composable

Every tool uses a single composable for consistent state management:

```typescript
const { loading, error, resultBlob, execute } = useToolOperation({
  toolId: "merge",
  endpoint: "/general/merge-pdfs",
  multiFile: true,
});
```

### PDF processing

- Pure Node.js operations (merge, split, rotate, watermark, metadata) → **pdf-lib**
- Compression → **Ghostscript CLI** (`gs`)
- Encryption → **qpdf CLI**
- Office conversion → **LibreOffice CLI**
- PDF rendering → **pdftoppm CLI** (poppler-utils)
