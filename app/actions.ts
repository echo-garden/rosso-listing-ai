"use server";

import { ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalInt(formData: FormData, key: string) {
  const value = optionalString(formData, key);
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function requiredString(formData: FormData, key: string) {
  const value = optionalString(formData, key);
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
}

export async function createProduct(formData: FormData) {
  const product = await prisma.product.create({
    data: {
      productType: requiredString(formData, "productType"),
      condition: requiredString(formData, "condition"),
      brandName: optionalString(formData, "brandName"),
      characterName: optionalString(formData, "characterName"),
      size: optionalString(formData, "size"),
      color: optionalString(formData, "color"),
      costPrice: optionalInt(formData, "costPrice"),
      salePrice: optionalInt(formData, "salePrice"),
      staffMemo: optionalString(formData, "staffMemo")
    }
  });

  await saveImages(product.id, formData.getAll("images"));
  revalidatePath("/products");
  redirect(`/products/${product.id}`);
}

export async function updateProduct(productId: string, formData: FormData) {
  const status = requiredString(formData, "status") as ProductStatus;

  await prisma.product.update({
    where: { id: productId },
    data: {
      title: optionalString(formData, "title"),
      productType: requiredString(formData, "productType"),
      condition: requiredString(formData, "condition"),
      brandName: optionalString(formData, "brandName"),
      characterName: optionalString(formData, "characterName"),
      size: optionalString(formData, "size"),
      color: optionalString(formData, "color"),
      costPrice: optionalInt(formData, "costPrice"),
      salePrice: optionalInt(formData, "salePrice"),
      staffMemo: optionalString(formData, "staffMemo"),
      status,
      mercariProductId: optionalString(formData, "mercariProductId"),
      mercariProductStatus: optionalString(formData, "mercariProductStatus")
    }
  });

  await saveImages(productId, formData.getAll("images"));
  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");
  redirect(`/products/${productId}`);
}

async function saveImages(productId: string, values: FormDataEntryValue[]) {
  const files = values.filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length === 0) return;

  const existingCount = await prisma.productImage.count({ where: { productId } });
  const saved = await Promise.all(files.map((file) => storage.save(file)));

  await prisma.productImage.createMany({
    data: saved.map((file, index) => ({
      productId,
      url: file.url,
      storageKey: file.storageKey,
      sortOrder: existingCount + index
    }))
  });
}
