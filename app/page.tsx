import Link from "next/link";
import { ProductStatus } from "@prisma/client";
import { Card, PageTitle } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { PRODUCT_STATUS_LABELS } from "@/lib/status";

export default async function DashboardPage() {
  const [totalProducts, generatedProducts, mercariDraftProducts, soldProducts, recentProducts] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: ProductStatus.generated } }),
    prisma.product.count({ where: { status: ProductStatus.mercari_unopened } }),
    prisma.product.count({ where: { status: ProductStatus.sold } }),
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { generatedContent: true }
    })
  ]);

  const stats = [
    { label: "Products", value: totalProducts },
    { label: "Generated", value: generatedProducts },
    { label: "Mercari drafts", value: mercariDraftProducts },
    { label: "Sold", value: soldProducts }
  ];

  return (
    <div>
      <PageTitle
        title="Dashboard"
        action={
          <Link href="/products/new" className="rounded-md bg-rosso-600 px-3 py-2 text-sm font-bold text-white">
            New
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-zinc-600">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
          </Card>
        ))}
      </div>
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">Recently updated</h2>
        <div className="space-y-3">
          {recentProducts.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="block rounded-md border border-zinc-200 p-4">
              <p className="font-semibold">{product.generatedContent?.mercariTitle ?? product.title ?? product.productType}</p>
              <p className="mt-1 text-sm text-zinc-600">
                {PRODUCT_STATUS_LABELS[product.status]} / {product.updatedAt.toLocaleDateString("ja-JP")}
              </p>
            </Link>
          ))}
          {recentProducts.length === 0 ? <p className="text-sm text-zinc-600">No products yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
