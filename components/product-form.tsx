import type { Product } from "@prisma/client";
import { SubmitButton } from "@/components/submit-button";
import { Field, Input, Select, Textarea } from "@/components/ui";
import { PRODUCT_STATUS_OPTIONS } from "@/lib/status";

export function ProductForm({
  product,
  action,
  showStatus = false
}: {
  product?: Product;
  action: (formData: FormData) => Promise<void>;
  showStatus?: boolean;
}) {
  return (
    <form action={action} className="space-y-4">
      {product ? (
        <Field label="Title">
          <Input name="title" defaultValue={product.title ?? ""} />
        </Field>
      ) : null}

      <Field label="Images">
        <Input name="images" type="file" accept="image/*" multiple />
      </Field>

      <Field label="Tag / size images">
        <Input name="tagImages" type="file" accept="image/*" multiple />
      </Field>

      <Field label="Damage / logo images">
        <Input name="detailImages" type="file" accept="image/*" multiple />
      </Field>

      <Field label="Product type">
        <Input name="productType" defaultValue={product?.productType === "未分類" ? "" : product?.productType ?? ""} placeholder="キャラT、スニーカーなど" />
      </Field>

      <Field label="Condition">
        <Input name="condition" defaultValue={product?.condition === "未確認" ? "" : product?.condition ?? ""} placeholder="目立つ傷なし、使用感ありなど" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Brand name">
          <Input name="brandName" defaultValue={product?.brandName ?? ""} />
        </Field>
        <Field label="Character name">
          <Input name="characterName" defaultValue={product?.characterName ?? ""} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Size">
          <Input name="size" defaultValue={product?.size ?? ""} />
        </Field>
        <Field label="Color">
          <Input name="color" defaultValue={product?.color ?? ""} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Cost price">
          <Input name="costPrice" type="number" inputMode="numeric" defaultValue={product?.costPrice ?? ""} />
        </Field>
        <Field label="Sale price">
          <Input name="salePrice" type="number" inputMode="numeric" defaultValue={product?.salePrice ?? ""} />
        </Field>
      </div>

      <Field label="Staff memo">
        <Textarea name="staffMemo" rows={5} defaultValue={product?.staffMemo ?? ""} />
      </Field>

      {showStatus ? (
        <>
          <Field label="Status">
            <Select name="status" defaultValue={product?.status ?? "draft"}>
              {PRODUCT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Mercari Shops product ID">
            <Input name="mercariProductId" defaultValue={product?.mercariProductId ?? ""} />
          </Field>
          <Field label="Mercari Shops product status">
            <Input name="mercariProductStatus" defaultValue={product?.mercariProductStatus ?? ""} />
          </Field>
        </>
      ) : null}

      <div className="sticky bottom-16 bg-white py-3">
        <SubmitButton className="w-full" pendingLabel="Saving and analyzing...">
          Save product
        </SubmitButton>
      </div>
    </form>
  );
}
