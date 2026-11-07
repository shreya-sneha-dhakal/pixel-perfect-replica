import { createServerFn } from "@tanstack/react-start";

import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES, type PhotoAnalysisResult } from "./photo-search-types";
import { analyzeFurniturePhoto } from "./photo-analysis.server";

export const analyzePhoto = createServerFn({ method: "POST" })
  .inputValidator((input: { dataUrl: string }) => {
    if (typeof input?.dataUrl !== "string") throw new Error("Missing image");
    return input;
  })
  .handler(async ({ data }): Promise<PhotoAnalysisResult> => {
    const match = /^data:(image\/[a-z]+);base64,/.exec(data.dataUrl);
    const mime = match?.[1];
    if (!mime || !(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(mime)) {
      return { ok: false, code: "unsupported", message: "Please upload a JPG, PNG, or WEBP image." };
    }
    if (data.dataUrl.length * 0.75 > MAX_IMAGE_BYTES * 1.05) {
      return { ok: false, code: "unsupported", message: "Image is too large (max 5 MB)." };
    }
    return analyzeFurniturePhoto(data.dataUrl);
  });
