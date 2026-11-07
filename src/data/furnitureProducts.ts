import sofa1Img from "../assets/furniture/sofa-1.jpg";
import sofa2Img from "../assets/furniture/sofa-2.jpg";
import sofa3Img from "../assets/furniture/sofa-3.jpg";
import bed1Img from "../assets/furniture/bed-1.jpg";
import bed2Img from "../assets/furniture/bed-2.jpg";
import bed3Img from "../assets/furniture/bed-3.jpg";
import desk1Img from "../assets/furniture/desk-1.jpg";
import desk2Img from "../assets/furniture/desk-2.jpg";
import desk3Img from "../assets/furniture/desk-3.jpg";
import chair1Img from "../assets/furniture/chair-1.jpg";
import chair2Img from "../assets/furniture/chair-2.jpg";
import chair3Img from "../assets/furniture/chair-3.jpg";
import table1Img from "../assets/furniture/table-1.jpg";
import table2Img from "../assets/furniture/table-2.jpg";
import table3Img from "../assets/furniture/table-3.jpg";
import type { FurnitureProduct } from "../types/furniture";

/**
 * SAMPLE DATA — illustrative demo products only.
 * Not verified retailer products; prices are illustrative, not live retailer prices.
 * Images are AI-generated illustrations stored locally; retailerUrl is null.
 */
export const furnitureProducts: FurnitureProduct[] = [
  { id: "sofa-1", title: "Linden Three-Seat Sofa", category: "Sofas", widthM: 2.1, depthM: 0.92, heightM: 0.84, priceUSD: 1299, imageUrl: sofa1Img, retailerUrl: null },
  { id: "sofa-2", title: "Marlo Compact Loveseat", category: "Sofas", widthM: 1.5, depthM: 0.85, heightM: 0.8, priceUSD: 749, imageUrl: sofa2Img, retailerUrl: null },
  { id: "sofa-3", title: "Oslo Corner Sectional", category: "Sofas", widthM: 2.8, depthM: 1.75, heightM: 0.86, priceUSD: 2149, imageUrl: sofa3Img, retailerUrl: null },
  { id: "bed-1", title: "Haven Queen Platform Bed", category: "Beds", widthM: 1.63, depthM: 2.13, heightM: 1.05, priceUSD: 899, imageUrl: bed1Img, retailerUrl: null },
  { id: "bed-2", title: "Nordby King Upholstered Bed", category: "Beds", widthM: 1.98, depthM: 2.18, heightM: 1.2, priceUSD: 1499, imageUrl: bed2Img, retailerUrl: null },
  { id: "bed-3", title: "Pine Twin Daybed", category: "Beds", widthM: 1.0, depthM: 1.98, heightM: 0.9, priceUSD: 429, imageUrl: bed3Img, retailerUrl: null },
  { id: "desk-1", title: "Atlas Oak Writing Desk", category: "Desks", widthM: 1.2, depthM: 0.6, heightM: 0.75, priceUSD: 389, imageUrl: desk1Img, retailerUrl: null },
  { id: "desk-2", title: "Rise Standing Desk", category: "Desks", widthM: 1.4, depthM: 0.7, heightM: 1.2, priceUSD: 649, imageUrl: desk2Img, retailerUrl: null },
  { id: "desk-3", title: "Nook Wall Desk", category: "Desks", widthM: 0.9, depthM: 0.45, heightM: 0.76, priceUSD: 219, imageUrl: desk3Img, retailerUrl: null },
  { id: "chair-1", title: "Arlo Lounge Armchair", category: "Chairs", widthM: 0.82, depthM: 0.86, heightM: 0.78, priceUSD: 549, imageUrl: chair1Img, retailerUrl: null },
  { id: "chair-2", title: "Wren Dining Chair", category: "Chairs", widthM: 0.46, depthM: 0.52, heightM: 0.82, priceUSD: 149, imageUrl: chair2Img, retailerUrl: null },
  { id: "chair-3", title: "Ergo Mesh Office Chair", category: "Chairs", widthM: 0.66, depthM: 0.66, heightM: 1.15, priceUSD: 329, imageUrl: chair3Img, retailerUrl: null },
  { id: "table-1", title: "Sienna Round Dining Table", category: "Tables", widthM: 1.2, depthM: 1.2, heightM: 0.75, priceUSD: 799, imageUrl: table1Img, retailerUrl: null },
  { id: "table-2", title: "Bloc Walnut Coffee Table", category: "Tables", widthM: 1.1, depthM: 0.6, heightM: 0.4, priceUSD: 349, imageUrl: table2Img, retailerUrl: null },
  { id: "table-3", title: "Taper Side Table", category: "Tables", widthM: 0.45, depthM: 0.45, heightM: 0.55, priceUSD: 129, imageUrl: table3Img, retailerUrl: null },
];
