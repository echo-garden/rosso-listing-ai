"use server";

import { ProductStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { applySavedAnalysisToProduct } from "@/lib/products/apply-analysis";
import { runAndSaveProductAnalysis } from "@/lib/products/analyze-product";
import { generateAndSaveListingContent } from "@/lib/products/generate-content";
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
      productType: optionalString(formData, "productType") ?? "未分類",
      condition: optionalString(formData, "condition") ?? "未確認",
      brandName: optionalString(formData, "brandName"),
      characterName: optionalString(formData, "characterName"),
      size: optionalString(formData, "size"),
      color: optionalString(formData, "color"),
      costPrice: optionalInt(formData, "costPrice"),
      salePrice: optionalInt(formData, "salePrice"),
      staffMemo: optionalString(formData, "staffMemo")
    }
  });

  const imageCount =
    (await saveImages(product.id, formData.getAll("images"), "product")) +
    (await saveImages(product.id, formData.getAll("tagImages"), "tag")) +
    (await saveImages(product.id, formData.getAll("detailImages"), "detail"));
  const analysisResult = imageCount > 0 ? await runAndSaveProductAnalysis(product.id) : null;
  const url = new URL(`/products/${product.id}`, process.env.APP_URL ?? "http://localhost:3000");
  if (analysisResult) {
    await applySavedAnalysisToProduct(product.id);
    const generated = await generateAndSaveListingContent(product.id);
    if (analysisResult.mockMode) url.searchParams.set("analysisMock", "1");
    if (generated.mockMode) url.searchParams.set("mock", "1");
  }

  revalidatePath("/products");
  redirect(`${url.pathname}${url.search}`);
}

export async function updateProduct(productId: string, formData: FormData) {
  const status = requiredString(formData, "status") as ProductStatus;

  await prisma.product.update({
    where: { id: productId },
    data: {
      title: optionalString(formData, "title"),
      productType: optionalString(formData, "productType") ?? "未分類",
      condition: optionalString(formData, "condition") ?? "未確認",
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

  const imageCount =
    (await saveImages(productId, formData.getAll("images"), "product")) +
    (await saveImages(productId, formData.getAll("tagImages"), "tag")) +
    (await saveImages(productId, formData.getAll("detailImages"), "detail"));
  const analysisResult = imageCount > 0 ? await runAndSaveProductAnalysis(productId) : null;
  const url = new URL(`/products/${productId}`, process.env.APP_URL ?? "http://localhost:3000");
  if (analysisResult) {
    await applySavedAnalysisToProduct(productId);
    const generated = await generateAndSaveListingContent(productId);
    if (analysisResult.mockMode) url.searchParams.set("analysisMock", "1");
    if (generated.mockMode) url.searchParams.set("mock", "1");
  }

  revalidatePath(`/products/${productId}`);
  revalidatePath("/products");
  redirect(`${url.pathname}${url.search}`);
}

export async function applyProductAnalysis(productId: string) {
  await applySavedAnalysisToProduct(productId, { overwrite: true });

  revalidatePath(`/products/${productId}`);
  revalidatePath(`/products/${productId}/edit`);
  revalidatePath("/products");
  redirect(`/products/${productId}`);
}

export async function confirmListing(productId: string, formData: FormData) {
  const title = requiredString(formData, "title");
  const description = requiredString(formData, "description");
  const price = optionalInt(formData, "price");
  const condition = requiredString(formData, "condition");
  const categoryId = optionalString(formData, "categoryId");
  const shippingConfigurationId = optionalString(formData, "shippingConfigurationId");
  const stock = optionalInt(formData, "stock") ?? 1;
  const confirmedBy = optionalString(formData, "confirmedBy");
  const imageUrls = parseLines(requiredString(formData, "imageUrls"));

  if (price == null || price <= 0) {
    throw new Error("price is required");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      generatedContent: true,
      analysis: true
    }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const mercariReady = Boolean(
    title &&
      description &&
      price > 0 &&
      condition &&
      categoryId &&
      shippingConfigurationId &&
      imageUrls.length > 0 &&
      imageUrls.every(isExternalUrl) &&
      stock > 0
  );

  await prisma.confirmedListing.upsert({
    where: { productId },
    create: {
      productId,
      title,
      description,
      price,
      condition,
      categoryId,
      shippingConfigurationId,
      imageUrls: toJsonValue(imageUrls),
      stock,
      confirmedBy,
      sourceSnapshot: toJsonValue(buildConfirmedSourceSnapshot(product)),
      mercariReady
    },
    update: {
      title,
      description,
      price,
      condition,
      categoryId,
      shippingConfigurationId,
      imageUrls: toJsonValue(imageUrls),
      stock,
      confirmedBy,
      confirmedAt: new Date(),
      sourceSnapshot: toJsonValue(buildConfirmedSourceSnapshot(product)),
      mercariReady
    }
  });

  revalidatePath(`/products/${productId}`);
  redirect(`/products/${productId}`);
}

async function saveImages(productId: string, values: FormDataEntryValue[], imageRole: string) {
  const files = values.filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length === 0) return 0;

  const existingCount = await prisma.productImage.count({ where: { productId } });
  const saved = await Promise.all(files.map((file) => storage.save(file)));

  await prisma.productImage.createMany({
    data: saved.map((file, index) => ({
      productId,
      url: file.url,
      storageKey: file.storageKey,
      imageRole,
      sortOrder: existingCount + index
    }))
  });

  return files.length;
}

function parseLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isExternalUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}

type ConfirmedSourceProduct = Prisma.ProductGetPayload<{
  include: {
    images: true;
    generatedContent: true;
    analysis: true;
  };
}>;

function buildConfirmedSourceSnapshot(product: ConfirmedSourceProduct) {
  return {
    product: {
      id: product.id,
      title: product.title,
      productType: product.productType,
      condition: product.condition,
      brandName: product.brandName,
      characterName: product.characterName,
      size: product.size,
      color: product.color,
      salePrice: product.salePrice
    },
    generatedContent: product.generatedContent,
    analysis: product.analysis,
    imageUrls: product.images.map((image) => image.url)
  };
}
