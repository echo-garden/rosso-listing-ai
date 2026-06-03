import { notFound } from "next/navigation";
import { updateProduct } from "@/app/actions";
import { ProductForm } from "@/components/product-form";
import { PageTitle } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const action = updateProduct.bind(null, product.id);

  return (
    <div>
      <PageTitle title="Edit product" />
      <ProductForm product={product} action={action} showStatus />
    </div>
  );
}
