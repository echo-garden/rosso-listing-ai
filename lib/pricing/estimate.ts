import type { Product } from "@prisma/client";
import type { ProductImageAnalysis } from "@/lib/ai/analyze";

export type PriceEstimate = {
  priceMin: number | null;
  priceMax: number | null;
  recommendedPrice: number | null;
  priceReason: string;
};

const BASE_PRICE_BY_TYPE: Record<string, number> = {
  "キャラT": 3980,
  "古着Tシャツ": 3980,
  "ロンT": 4480,
  "パーカー": 5980,
  "ジャケット": 7980,
  "パンツ": 4980,
  "スニーカー": 6980,
  "スニーカーペイント作品": 12800,
  "バッグ": 4980,
  "小物": 1980
};

export function completePriceEstimate(product: Product, analysis: ProductImageAnalysis): PriceEstimate {
  if (analysis.recommendedPrice || analysis.priceMin || analysis.priceMax) {
    const recommendedPrice = analysis.recommendedPrice ?? product.salePrice ?? midpoint(analysis.priceMin, analysis.priceMax);
    return {
      priceMin: analysis.priceMin ?? (recommendedPrice ? Math.max(1000, recommendedPrice - 1000) : null),
      priceMax: analysis.priceMax ?? (recommendedPrice ? recommendedPrice + 1000 : null),
      recommendedPrice,
      priceReason: analysis.priceReason || "画像解析の価格候補をもとにしています。状態と相場確認後に調整してください。"
    };
  }

  const base = product.salePrice ?? BASE_PRICE_BY_TYPE[analysis.productType] ?? BASE_PRICE_BY_TYPE[product.productType] ?? 3980;
  return {
    priceMin: Math.max(1000, base - 1000),
    priceMax: base + 1500,
    recommendedPrice: base,
    priceReason: "商品タイプごとの保守的な初期価格です。ブランド、サイズ、状態、店頭相場を確認して調整してください。"
  };
}

function midpoint(min: number | null, max: number | null) {
  if (min == null && max == null) return null;
  if (min == null) return max;
  if (max == null) return min;
  return Math.round((min + max) / 2);
}
