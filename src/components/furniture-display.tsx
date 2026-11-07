import { useState } from "react";
import type { FurnitureProduct } from "../types/furniture";

export const fmtPrice = (p: number | null) =>
  p == null
    ? "Price unavailable"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: Number.isInteger(p) ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(p);

export const fmtDims = (p: FurnitureProduct) => `${p.widthM.toFixed(2)} × ${p.depthM.toFixed(2)} × ${p.heightM.toFixed(2)} m`;

export const retailerName = (url: string) => {
  const hostname = new URL(url).hostname;
  if (hostname.includes("ikea")) return "IKEA";
  if (hostname.includes("target")) return "Target";
  return "Retailer";
};

export function ProductImage({ product }: { product: FurnitureProduct }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
      {product.imageUrl && !failed ? (
        <img
          src={product.imageUrl}
          alt={product.title}
          loading="lazy"
          width={944}
          height={704}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
          <span className="font-display text-4xl">{product.category.charAt(0)}</span>
          <span className="text-xs uppercase tracking-widest">Image unavailable</span>
        </div>
      )}
    </div>
  );
}
