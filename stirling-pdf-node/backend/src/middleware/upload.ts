import multer, { StorageEngine } from "multer";
import path from "path";
import os from "os";

/** Multer instance that stores files in the OS temp directory */
const storage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `spdf-${unique}${path.extname(file.originalname)}`);
  },
});

/** Max upload size: 500 MB */
const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});
