import type { ConfirmedListing, GeneratedContent, Product, ProductAnalysis, ProductImage } from "@prisma/client";
import { confirmListing } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { Card, Field, Input, Textarea } from "@/components/ui";

type ProductForConfirmation = Product & {
  images: ProductImage[];
  generatedContent: GeneratedContent | null;
  analysis: ProductAnalysis | null;
  confirmedListing: ConfirmedListing | null;
};

export function ConfirmedListingForm({ product }: { product: ProductForConfirmation }) {
  const confirmed = product.confirmedListing;
  const action = confirmListing.bind(null, product.id);
  const imageUrls = confirmed ? jsonStringArray(confirmed.imageUrls) : product.images.map((image) => image.url);
  const title = confirmed?.title ?? product.generatedContent?.mercariTitle ?? product.title ?? product.productType;
  const description = confirmed?.description ?? product.generatedContent?.mercariDescription ?? "";
  const price = confirmed?.price ?? product.salePrice ?? product.analysis?.recommendedPrice ?? parsePriceSuggestion(product.generatedContent?.priceSuggestion) ?? "";
  const condition = confirmed?.condition ?? product.condition;

  return (
    <Card className="mt-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Confirmed listing</h2>
          <p className="mt-1 text-sm text-zinc-600">人間が確認したメルカリShops送信用データです。API送信時はこの内容だけを使います。</p>
        </div>
        {confirmed ? (
          <span className={`rounded-md px-2 py-1 text-xs font-bold ${confirmed.mercariReady ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"}`}>
            {confirmed.mercariReady ? "Mercari ready" : "Missing fields"}
          </span>
        ) : null}
      </div>

      <form action={action} className="space-y-4">
        <Field label="Title">
          <Input name="title" required defaultValue={title} />
        </Field>

        <Field label="Description">
          <Textarea name="description" required rows={7} defaultValue={description} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price">
            <Input name="price" required type="number" inputMode="numeric" defaultValue={price} />
          </Field>
          <Field label="Stock">
            <Input name="stock" required type="number" inputMode="numeric" defaultValue={confirmed?.stock ?? 1} />
          </Field>
        </div>

        <Field label="Condition">
          <Input name="condition" required defaultValue={condition} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Mercari category ID">
            <Input name="categoryId" defaultValue={confirmed?.categoryId ?? ""} placeholder="後でMercariカテゴリIDを設定" />
          </Field>
          <Field label="Shipping configuration ID">
            <Input name="shippingConfigurationId" defaultValue={confirmed?.shippingConfigurationId ?? ""} placeholder="配送設定ID" />
          </Field>
        </div>

        <Field label="Image URLs">
          <Textarea name="imageUrls" required rows={4} defaultValue={imageUrls.join("\n")} />
        </Field>
        <p className="-mt-2 text-xs text-zinc-500">メルカリShops送信には外部から取得できる http(s) の画像URLが必要です。</p>

        <Field label="Confirmed by">
          <Input name="confirmedBy" defaultValue={confirmed?.confirmedBy ?? ""} placeholder="staff name" />
        </Field>

        {confirmed ? (
          <div className="rounded-md bg-zinc-50 p-3 text-sm text-zinc-600">
            <p>Confirmed at: {confirmed.confirmedAt.toLocaleString("ja-JP")}</p>
            {confirmed.mercariProductId ? <p>Mercari product ID: {confirmed.mercariProductId}</p> : null}
            {confirmed.mercariStatus ? <p>Mercari status: {confirmed.mercariStatus}</p> : null}
          </div>
        ) : null}

        <SubmitButton className="w-full" pendingLabel="Confirming...">
          Confirm listing
        </SubmitButton>
      </form>
    </Card>
  );
}

function jsonStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function parsePriceSuggestion(value: string | null | undefined) {
  if (!value) return null;
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return null;
  const parsed = Number.parseInt(digits, 10);
  return Number.isNaN(parsed) ? null : parsed;
}
