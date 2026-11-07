import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";

import type { PhotoAnalysisResult } from "./photo-search-types";

const MODEL = "openai/gpt-6-astra";
const GATEWAY = "https://ai.gateway.lovable.dev/v1";

const schema = z.object({
  isFurniture: z.boolean(),
  category: z.enum(["Sofas", "Beds", "Desks", "Chairs", "Tables", "Other"]),
  primaryColor: z.string(),
  material: z.string(),
  style: z.string(),
  keywords: z.array(z.string()),
});

const INSTRUCTIONS = `You analyze a single photo of a furniture item for a furniture catalog search.
Return: isFurniture (false if the photo does not clearly show furniture), category (one of Sofas, Beds, Desks, Chairs, Tables, or Other),
primaryColor (one or two plain words, e.g. "white", "black", "walnut brown"), material (apparent material, e.g. "fabric", "leather", "oak wood", "metal", "laminate"),
style (one or two words, e.g. "modern", "mid-century", "scandinavian", "industrial", "traditional", "minimalist"),
and 4-8 short lowercase descriptive keywords (shape, features, e.g. "sectional", "armrests", "round", "storage", "wheels").
Describe only what is visible. Do not identify brands or products.`;

export async function analyzeFurniturePhoto(dataUrl: string): Promise<PhotoAnalysisResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, code: "not_configured", message: "Image analysis is not configured on the server." };

  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
      const res = await fetch(input, { ...init, headers });
      runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
      return res;
    },
  });

  try {
    const result = streamText({
      model: provider.responses(MODEL),
      instructions: INSTRUCTIONS,
      maxRetries: 0,
      output: Output.object({ schema }),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this furniture photo." },
            { type: "image", image: new URL(dataUrl) },
          ],
        },
      ],
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const out = await result.output;
    if (!out.isFurniture) {
      return { ok: false, code: "not_furniture", message: "The AI could not find a furniture item in this photo." };
    }
    return {
      ok: true,
      analysis: {
        category: out.category,
        primaryColor: out.primaryColor.trim().toLowerCase(),
        material: out.material.trim().toLowerCase(),
        style: out.style.trim().toLowerCase(),
        keywords: out.keywords.map((k) => k.trim().toLowerCase()).filter(Boolean).slice(0, 8),
      },
    };
  } catch (error) {
    console.error("photo analysis failed", error);
    if (NoObjectGeneratedError.isInstance(error)) {
      return { ok: false, code: "api_error", message: "The AI response could not be read. Please try another photo." };
    }
    const status = APICallError.isInstance(error) ? error.statusCode : undefined;
    if (status === 402) return { ok: false, code: "api_error", message: "AI credits are used up. Add credits in Settings → Plans & credits." };
    if (status === 429) return { ok: false, code: "api_error", message: "Too many requests right now. Please wait a moment and try again." };
    if (status === 401 || status === 403) return { ok: false, code: "not_configured", message: "Image analysis is not available for this workspace." };
    return { ok: false, code: "api_error", message: "Image analysis failed. Please try again later." };
  }
}
