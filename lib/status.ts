import type { ProductStatus } from "@prisma/client";

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "下書き",
  generated: "AI生成済み",
  mercari_unopened: "Mercari Shops非公開",
  mercari_opened: "Mercari Shops公開済み",
  listed_other: "他媒体掲載済み",
  sold: "販売済み",
  archived: "アーカイブ"
};

export const PRODUCT_STATUS_OPTIONS = Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label
}));
