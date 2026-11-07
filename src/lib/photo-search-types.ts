export interface PhotoAnalysis {
  category: string;
  primaryColor: string;
  material: string;
  style: string;
  keywords: string[];
}

export type PhotoAnalysisResult =
  | { ok: true; analysis: PhotoAnalysis }
  | { ok: false; code: "not_configured" | "api_error" | "not_furniture" | "unsupported"; message: string };

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
