import { describe, expect, it } from "vitest";
import { furnitureAttributes } from "@/data/furnitureAttributes";
import { furnitureProducts } from "@/data/furnitureProducts";
import { matchProducts } from "@/lib/photo-match";

describe("photo match ranking", () => {
  it("returns only same-category catalog products", () => {
    const m = matchProducts({ category: "Sofas", primaryColor: "black", material: "leather", style: "modern", keywords: [] }, furnitureProducts, furnitureAttributes);
    expect(m.every((x) => x.product.category === "Sofas")).toBe(true);
    expect(m[0]?.product.id).toBe("ikea-kivik-80519531");
  });
  it("returns nothing for a category not in the catalog", () => {
    expect(matchProducts({ category: "Other" }, furnitureProducts, furnitureAttributes)).toHaveLength(0);
  });
});
