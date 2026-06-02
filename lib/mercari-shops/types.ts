export type MercariShopsCreateProductInput = {
  title: string;
  description: string;
  price: number;
  condition: string;
  categoryId: string;
  shippingConfigurationId: string;
  imageUrls: string[];
  stock: number;
};

export type MercariShopsCreateProductResult = {
  productId: string;
  status: "unpublished";
};
