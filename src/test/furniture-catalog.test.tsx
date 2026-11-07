import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FurnitureCatalog } from "@/components/FurnitureCatalog";
import { furnitureProducts } from "@/data/furnitureProducts";

const verifiedProducts = furnitureProducts.filter((product) => product.retailerUrl !== null);

describe("Furniture catalog retailer listings", () => {
  it("keeps all 15 sample products and adds six verified retailer products with unique IDs", () => {
    expect(furnitureProducts.filter((product) => product.retailerUrl === null)).toHaveLength(15);
    expect(verifiedProducts).toHaveLength(6);
    expect(new Set(furnitureProducts.map((product) => product.id)).size).toBe(21);
  });

  it("stores the verified KIVIK dimensions in meters and its regular USD price", () => {
    const sofa = furnitureProducts.find((product) => product.id === "ikea-kivik-80519531");

    expect(sofa).toMatchObject({ widthM: 2.270125, depthM: 0.949325, heightM: 0.828675, priceUSD: 1299 });
  });

  it("opens a verified retailer listing in a new tab without labeling it as a sample", () => {
    render(<FurnitureCatalog products={furnitureProducts} onAddProduct={() => {}} />);

    const link = screen.getByRole("link", { name: /View KIVIK Sofa at IKEA/ });
    expect(link).toHaveAttribute("href", "https://www.ikea.com/us/en/p/kivik-sofa-grann-bomstad-black-80519531/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(screen.getAllByText("Verified retailer")).toHaveLength(6);
    expect(screen.getAllByText("Sample product")).toHaveLength(15);
  });

  it("passes the selected product to onAddProduct", () => {
    const onAddProduct = vi.fn();
    render(<FurnitureCatalog products={furnitureProducts} onAddProduct={onAddProduct} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Add to Room" })[0]);

    expect(onAddProduct).toHaveBeenCalledTimes(1);
    expect(onAddProduct).toHaveBeenCalledWith(furnitureProducts[0]);
  });
});
