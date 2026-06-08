import { Prisma } from "@prisma/client";
import { analyzeProductImages } from "@/lib/ai/analyze";
import { normalizeBrandCandidates } from "@/lib/brands/catalog";
import { prisma } from "@/lib/prisma";
import { completePriceEstimate } from "@/lib/pricing/estimate";

export async function runAndSaveProductAnalysis(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      analysis: true
    }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const result = await analyzeProductImages(product);
  const normalizedAnalysis = normalizeBrandCandidates(result.analysis);
  const price = completePriceEstimate(product, normalizedAnalysis);
  const analysis = { ...normalizedAnalysis, ...price };

  await prisma.productAnalysis.upsert({
    where: { productId: product.id },
    create: {
      productId: product.id,
      ...analysis,
      brandCandidates: toJsonValue(analysis.brandCandidates),
      rawJson: toJsonValue(result.rawJson),
      mockMode: result.mockMode
    },
    update: {
      ...analysis,
      brandCandidates: toJsonValue(analysis.brandCandidates),
      rawJson: toJsonValue(result.rawJson),
      mockMode: result.mockMode
    }
  });

  return { mockMode: result.mockMode };
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}
