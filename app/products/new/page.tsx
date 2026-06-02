import { createProduct } from "@/app/actions";
import { PageTitle } from "@/components/ui";
import { ProductForm } from "@/components/product-form";

export default function NewProductPage() {
  return (
    <div>
      <PageTitle title="New product" />
      <ProductForm action={createProduct} />
    </div>
  );
}
