export interface FurnitureProduct {
  id: string;
  title: string;
  category: string;
  widthM: number;
  depthM: number;
  heightM: number;
  priceUSD: number | null;
  imageUrl: string | null;
  retailerUrl: string | null;
}
