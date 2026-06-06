/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { GeneratedContentForm } from "@/components/generated-content-form";
import { Card, PageTitle, SecondaryLink } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { PRODUCT_STATUS_LABELS } from "@/lib/status";

export default async function ProductDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mock?: string }>;
}) {
  const { id } = await params;
  const { mock } = await searchParams;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      generatedContent: true
    }
  });

  if (!product) notFound();

  return (
    <div>
      <PageTitle
        title="Product detail"
        action={<SecondaryLink href={`/products/${product.id}/edit`}>Edit</SecondaryLink>}
      />

      {mock === "1" ? (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          Mock generated content was used. Check OpenAI API settings if this was unexpected.
        </div>
      ) : null}

      <div className="mb-4 grid grid-cols-2 gap-2">
        {product.images.map((image) => (
          <div key={image.id} className="relative aspect-square overflow-hidden rounded-md bg-zinc-100">
            <img src={image.url} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Type" value={product.productType} />
          <Info label="Status" value={PRODUCT_STATUS_LABELS[product.status]} />
          <Info label="Condition" value={product.condition} />
          <Info label="Price" value={product.salePrice ? `${product.salePrice.toLocaleString()}円` : "-"} />
          <Info label="Brand" value={product.brandName ?? "-"} />
          <Info label="Character" value={product.characterName ?? "-"} />
          <Info label="Size" value={product.size ?? "-"} />
          <Info label="Color" value={product.color ?? "-"} />
        </div>
        {product.staffMemo ? (
          <div className="mt-4 border-t border-zinc-200 pt-4">
            <p className="text-sm font-semibold text-zinc-600">Staff memo</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{product.staffMemo}</p>
          </div>
        ) : null}
      </Card>

      <form action={`/api/products/${product.id}/generate`} method="post" className="mt-4">
        <button className="min-h-12 w-full rounded-md bg-rosso-600 px-4 py-2 text-sm font-bold text-white" type="submit">
          Generate AI content
        </button>
      </form>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Generated content</h2>
          <Link href="/settings" className="text-sm font-semibold text-rosso-700">
            Settings
          </Link>
        </div>
        {product.generatedContent ? (
          <GeneratedContentForm productId={product.id} initialValue={product.generatedContent} />
        ) : (
          <p className="rounded-md border border-zinc-200 p-4 text-sm text-zinc-600">Generate content to edit and copy listing text.</p>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
