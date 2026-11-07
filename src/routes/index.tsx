import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FurnitureCatalog } from "@/components/FurnitureCatalog";
import { furnitureProducts } from "@/data/furnitureProducts";
import type { FurnitureProduct } from "@/types/furniture";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Furney — Furniture Catalog" },
      { name: "description", content: "Browse furniture by size and budget, then add pieces to your room." },
      { property: "og:title", content: "Furney — Furniture Catalog" },
      { property: "og:description", content: "Your room. Your dimensions. Your budget." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [selected, setSelected] = useState<FurnitureProduct[]>([]);
  const handleAdd = (p: FurnitureProduct) => setSelected((s) => [p, ...s]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="font-display text-5xl text-foreground">Furney</h1>
          <p className="mt-2 text-muted-foreground">Your room. Your dimensions. Your budget.</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 rounded-2xl border border-border bg-secondary px-5 py-4 text-sm text-secondary-foreground">
          <strong>Sample data:</strong> these demo products and prices are illustrative, not live retailer listings.
        </div>

        <div className="mb-10 rounded-2xl border border-border bg-card p-5" aria-live="polite">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">onAddProduct demo</p>
          {selected.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Click “Add to Room” on any product.</p>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-foreground">Last added: <strong>{selected[0].title}</strong> ({selected.length} total)</span>
              <button type="button" onClick={() => setSelected([])} className="ml-auto text-muted-foreground underline">Clear</button>
            </div>
          )}
        </div>

        <FurnitureCatalog products={furnitureProducts} onAddProduct={handleAdd} />
      </main>
    </div>
  );
}
