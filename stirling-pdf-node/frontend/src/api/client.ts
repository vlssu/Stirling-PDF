import type { ApiError } from "@/types/tool";

const API_BASE = "/api/v1";

/**
 * Upload one or more files with additional form fields, returning a Blob (binary response).
 * Uses native fetch — no axios.
 */
export async function uploadFiles(
  endpoint: string,
  files: File | File[],
  params: Record<string, string | number | boolean> = {},
  fieldName = "fileInput"
): Promise<Blob> {
  const formData = new FormData();

  if (Array.isArray(files)) {
    files.forEach((f) => formData.append(fieldName, f));
  } else {
    formData.append(fieldName, files);
  }

  for (const [key, value] of Object.entries(params)) {
    formData.append(key, String(value));
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    body: formData,
    // Do NOT set Content-Type manually — browser sets it with boundary
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({})) as Partial<ApiError>;
    throw new Error(
      errBody.message ?? `Request failed with status ${response.status}`
    );
  }

  return response.blob();
}

/**
 * POST JSON to an API endpoint and return the parsed JSON response.
 */
export async function postJson<T>(
  endpoint: string,
  body: Record<string, unknown> = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({})) as Partial<ApiError>;
    throw new Error(
      errBody.message ?? `Request failed with status ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Upload files and get a JSON response (e.g., for metadata read).
 */
export async function uploadFilesForJson<T>(
  endpoint: string,
  file: File,
  params: Record<string, string | number | boolean> = {},
  fieldName = "fileInput"
): Promise<T> {
  const formData = new FormData();
  formData.append(fieldName, file);

  for (const [key, value] of Object.entries(params)) {
    formData.append(key, String(value));
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({})) as Partial<ApiError>;
    throw new Error(
      errBody.message ?? `Request failed with status ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Trigger a browser download from a Blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
