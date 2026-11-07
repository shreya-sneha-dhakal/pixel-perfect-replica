import { useMemo, useState } from "react";
import type { FurnitureProduct } from "../types/furniture";

export interface FurnitureCatalogProps {
  products: FurnitureProduct[];
  onAddProduct: (product: FurnitureProduct) => void;
}

const CATEGORIES = ["All", "Sofas", "Beds", "Desks", "Chairs", "Tables"] as const;
type SortOrder = "none" | "asc" | "desc";

const fmtPrice = (p: number | null) =>
  p == null ? "Price unavailable" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p);

const fmtDims = (p: FurnitureProduct) => `${p.widthM.toFixed(2)} × ${p.depthM.toFixed(2)} × ${p.heightM.toFixed(2)} m`;

const retailerName = (url: string) => {
  const hostname = new URL(url).hostname;
  if (hostname.includes("ikea")) return "IKEA";
  if (hostname.includes("target")) return "Target";
  return "Retailer";
};

function ProductImage({ product }: { product: FurnitureProduct }) {
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

export function FurnitureCatalog({ products, onAddProduct }: FurnitureCatalogProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<SortOrder>("none");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter(
      (p) => (category === "All" || p.category === category) && (!q || p.title.toLowerCase().includes(q)),
    );
    if (sort !== "none") {
      list = [...list].sort((a, b) => {
        // Products without a price always go last.
        if (a.priceUSD == null) return 1;
        if (b.priceUSD == null) return -1;
        return sort === "asc" ? a.priceUSD - b.priceUSD : b.priceUSD - a.priceUSD;
      });
    }
    return list;
  }, [products, query, category, sort]);

  return (
    <section className="w-full">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search furniture…"
          aria-label="Search products by title"
          className="w-full rounded-full border border-input bg-card px-5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring md:max-w-sm"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOrder)}
          aria-label="Sort by price"
          className="rounded-full border border-input bg-card px-5 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="none">Sort: Featured</option>
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
      </div>

      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <p className="font-display text-2xl text-foreground">No furniture found</p>
          <p className="mt-2 text-sm text-muted-foreground">Try a different search term or category.</p>
          <button
            type="button"
            onClick={() => { setQuery(""); setCategory("All"); }}
            className="mt-6 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <li key={p.id} className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
              <ProductImage product={p} />
              <div className="flex flex-1 flex-col gap-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    {p.category}{p.retailerUrl ? ` · ${retailerName(p.retailerUrl)}` : ""}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.retailerUrl ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {p.retailerUrl ? "Verified retailer" : "Sample product"}
                  </span>
                </div>
                <h3 className="font-display text-xl leading-tight text-card-foreground">{p.title}</h3>
                <p className="text-sm text-muted-foreground">W × D × H: {fmtDims(p)}</p>
                <p className="text-lg font-semibold text-foreground">
                  {fmtPrice(p.priceUSD)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">{p.retailerUrl ? "price at verification" : "sample price"}</span>
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => onAddProduct(p)}
                    className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Add to Room
                  </button>
                  {p.retailerUrl && (
                    <a
                      href={p.retailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-input px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      View at Retailer
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default FurnitureCatalog;
