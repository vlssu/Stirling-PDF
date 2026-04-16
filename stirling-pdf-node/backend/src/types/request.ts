import type { Request } from "express";

/** A request that carries a single uploaded file under `fileInput` */
export interface SingleFileRequest extends Request {
  file?: Express.Multer.File;
}

/** A request that carries multiple uploaded files under `fileInput` */
export interface MultiFileRequest extends Request {
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
}

/** Standard JSON error response */
export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
}
