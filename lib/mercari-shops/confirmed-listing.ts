import type { ConfirmedListing } from "@prisma/client";
import type { MercariShopsCreateProductInput } from "./types";

export function confirmedListingToMercariInput(listing: ConfirmedListing): MercariShopsCreateProductInput {
  const imageUrls = Array.isArray(listing.imageUrls)
    ? listing.imageUrls.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];

  if (!listing.categoryId) {
    throw new Error("Mercari category ID is required before submission.");
  }

  if (!listing.shippingConfigurationId) {
    throw new Error("Mercari shipping configuration ID is required before submission.");
  }

  if (imageUrls.length === 0) {
    throw new Error("At least one image URL is required before submission.");
  }

  if (!imageUrls.every((url) => url.startsWith("http://") || url.startsWith("https://"))) {
    throw new Error("Mercari Shops submission requires externally accessible image URLs.");
  }

  return {
    title: listing.title,
    description: listing.description,
    price: listing.price,
    condition: listing.condition,
    categoryId: listing.categoryId,
    shippingConfigurationId: listing.shippingConfigurationId,
    imageUrls,
    stock: listing.stock
  };
}
