/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { PageTitle } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { PRODUCT_STATUS_LABELS } from "@/lib/status";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      generatedContent: true
    }
  });

  return (
    <div>
      <PageTitle
        title="Products"
        action={
          <Link href="/products/new" className="rounded-md bg-rosso-600 px-3 py-2 text-sm font-bold text-white">
            New
          </Link>
        }
      />
      <div className="space-y-3">
        {products.map((product) => {
          const image = product.images[0];
          return (
            <Link key={product.id} href={`/products/${product.id}`} className="flex gap-3 rounded-md border border-zinc-200 p-3">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                {image ? <img src={image.url} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{product.generatedContent?.mercariTitle ?? product.title ?? product.productType}</p>
                <p className="mt-1 text-sm text-zinc-600">{product.productType}</p>
                <p className="mt-1 text-sm text-zinc-600">{PRODUCT_STATUS_LABELS[product.status]}</p>
                <p className="mt-1 text-sm font-semibold">{product.salePrice ? `${product.salePrice.toLocaleString()}円` : "価格未設定"}</p>
                <p className="mt-1 text-xs text-zinc-500">{product.updatedAt.toLocaleDateString("ja-JP")}</p>
              </div>
            </Link>
          );
        })}
        {products.length === 0 ? <p className="text-sm text-zinc-600">No products yet.</p> : null}
      </div>
    </div>
  );
}
