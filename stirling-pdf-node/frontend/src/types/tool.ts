/** Unique tool identifier */
export type ToolId =
  | "merge"
  | "split"
  | "rotate"
  | "compress"
  | "extractPages"
  | "removePages"
  | "addPassword"
  | "removePassword"
  | "watermark"
  | "metadata"
  | "imageToPdf"
  | "pdfToImage"
  | "officeToPdf";

export interface ToolDefinition {
  id: ToolId;
  name: string;
  description: string;
  icon: string;
  category: ToolCategory;
  endpoint: string;
  /** If true, accepts multiple files */
  multiFile?: boolean;
}

export type ToolCategory = "general" | "security" | "convert" | "misc";

export interface ToolOperationConfig {
  toolId: ToolId;
  endpoint: string;
  multiFile?: boolean;
}

export interface ApiError {
  error: string;
  message: string;
  status: number;
}
