import type { Request, Response, NextFunction } from "express";
import type { ErrorResponse } from "../types/request";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** Central error-handling middleware */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("[error]", err.message);

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const body: ErrorResponse = {
    error: err.name ?? "Error",
    message: err.message ?? "Internal Server Error",
    status: statusCode,
  };
  res.status(statusCode).json(body);
}
