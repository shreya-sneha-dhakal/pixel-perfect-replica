import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";

import { furnitureAttributes, type ProductAttributes } from "../data/furnitureAttributes";
import { matchProducts, type PhotoMatch } from "../lib/photo-match";
import { analyzePhoto } from "../lib/photo-search.functions";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES, type PhotoAnalysis } from "../lib/photo-search-types";
import type { FurnitureProduct } from "../types/furniture";
import { fmtDims, fmtPrice, ProductImage, retailerName } from "./furniture-display";

export interface PhotoSearchProps {
  products: FurnitureProduct[];
  onAddProduct: (product: FurnitureProduct) => void;
  attributes?: Record<string, ProductAttributes>;
  onClose?: () => void;
}

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string; manualSuggested: boolean }
  | { kind: "done"; source: "ai" | "manual"; analysis: Partial<PhotoAnalysis> & { category: string }; matches: PhotoMatch[] };

const MANUAL_CATEGORIES = ["Sofas", "Beds", "Desks", "Chairs", "Tables"];
const MANUAL_STYLES = ["", "modern", "minimalist", "scandinavian", "mid-century", "industrial", "traditional"];

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

export function PhotoSearch({ products, onAddProduct, attributes = furnitureAttributes, onClose }: PhotoSearchProps) {
  const analyze = useServerFn(analyzePhoto);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [manualCategory, setManualCategory] = useState("Sofas");
  const [manualStyle, setManualStyle] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      setPreview(null);
      setStatus({ kind: "error", message: "Unsupported image. Please upload a JPG, PNG, or WEBP file.", manualSuggested: false });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setPreview(null);
      setStatus({ kind: "error", message: "That image is larger than 5 MB. Please choose a smaller one.", manualSuggested: false });
      return;
    }
    const dataUrl = await readAsDataUrl(file);
    setPreview(dataUrl);
    setStatus({ kind: "loading" });
    try {
      const res = await analyze({ data: { dataUrl } });
      if (!res.ok) {
        setStatus({
          kind: "error",
          message: res.message,
          manualSuggested: res.code === "api_error" || res.code === "not_configured",
        });
        return;
      }
      setStatus({ kind: "done", source: "ai", analysis: res.analysis, matches: matchProducts(res.analysis, products, attributes) });
    } catch {
      setStatus({ kind: "error", message: "Could not reach the image analysis service.", manualSuggested: true });
    }
  };

  const runManual = () => {
    const analysis = { category: manualCategory, ...(manualStyle ? { style: manualStyle } : {}) };
    setStatus({ kind: "done", source: "manual", analysis, matches: matchProducts(analysis, products, attributes) });
  };

  return (
    <section aria-label="Search by photo" className="mb-10 rounded-3xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-card-foreground">Search by Photo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a furniture photo. AI describes it, then we find similar pieces from this catalog only.
          </p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="text-sm text-muted-foreground underline">
            Close
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <div className="md:w-64">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Upload furniture photo"
            className="hidden"
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={status.kind === "loading"}
            className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-input bg-muted text-sm text-muted-foreground hover:bg-accent disabled:opacity-60"
          >
            {preview ? (
              <img src={preview} alt="Your uploaded furniture" className="h-full w-full object-cover" />
            ) : (
              <span>Choose JPG, PNG or WEBP</span>
            )}
          </button>
          {preview && (
            <button type="button" onClick={() => inputRef.current?.click()} className="mt-2 text-xs text-muted-foreground underline">
              Use a different photo
            </button>
          )}
        </div>

        <div className="flex-1 text-sm" aria-live="polite">
          {status.kind === "idle" && <p className="text-muted-foreground">No photo analyzed yet.</p>}
          {status.kind === "loading" && (
            <p className="flex items-center gap-2 text-foreground">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Analyzing your photo…
            </p>
          )}
          {status.kind === "error" && (
            <div role="alert" className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-foreground">
              {status.message}
              {status.manualSuggested && <p className="mt-1 text-muted-foreground">You can use the manual search below instead.</p>}
            </div>
          )}
          {status.kind === "done" && (
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {status.source === "ai" ? "Identified by AI from your photo" : "Manual search — no photo was analyzed"}
              </p>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
                {(
                  [
                    ["Category", status.analysis.category],
                    ["Color", status.analysis.primaryColor],
                    ["Material", status.analysis.material],
                    ["Style", status.analysis.style],
                  ] as const
                )
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-medium capitalize text-foreground">{v}</dd>
                    </div>
                  ))}
              </dl>
              {!!status.analysis.keywords?.length && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {status.analysis.keywords.map((k) => (
                    <span key={k} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">{k}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          <details className="mt-6 rounded-2xl border border-border px-4 py-3" open={status.kind === "error" && status.manualSuggested}>
            <summary className="cursor-pointer font-medium text-foreground">Manual search (no AI)</summary>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Category
                <select value={manualCategory} onChange={(e) => setManualCategory(e.target.value)} className="rounded-full border border-input bg-card px-4 py-2 text-sm text-foreground">
                  {MANUAL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Style
                <select value={manualStyle} onChange={(e) => setManualStyle(e.target.value)} className="rounded-full border border-input bg-card px-4 py-2 text-sm capitalize text-foreground">
                  {MANUAL_STYLES.map((s) => <option key={s} value={s}>{s || "Any style"}</option>)}
                </select>
              </label>
              <button type="button" onClick={runManual} className="rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent">
                Find matches
              </button>
            </div>
          </details>
        </div>
      </div>

      {status.kind === "done" && (
        <div className="mt-8">
          {status.matches.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-muted-foreground">
              No similar products in our catalog for “{status.analysis.category}”.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {status.matches.map(({ product: p, reasons }) => (
                <li key={p.id} className="flex flex-col overflow-hidden rounded-3xl border border-border bg-background">
                  <ProductImage product={p} />
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      {p.category} · {p.retailerUrl ? retailerName(p.retailerUrl) : "Sample product"}
                    </span>
                    <h3 className="font-display text-xl leading-tight text-foreground">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">W × D × H: {fmtDims(p)}</p>
                    <p className="text-lg font-semibold text-foreground">
                      {fmtPrice(p.priceUSD)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">{p.retailerUrl ? "price at verification" : "sample price"}</span>
                    </p>
                    <ul className="list-disc pl-4 text-xs text-muted-foreground">
                      {reasons.map((r) => <li key={r}>{r}</li>)}
                    </ul>
                    <div className="mt-auto flex flex-wrap gap-2 pt-3">
                      <button type="button" onClick={() => onAddProduct(p)} className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                        Add to Room
                      </button>
                      {p.retailerUrl && (
                        <a href={p.retailerUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-input px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent">
                          View at Retailer
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

export default PhotoSearch;
