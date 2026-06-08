import { prisma } from "@/lib/prisma";

export async function applySavedAnalysisToProduct(productId: string, { overwrite = false }: { overwrite?: boolean } = {}) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { analysis: true }
  });

  if (!product?.analysis) {
    throw new Error("Product analysis is required");
  }

  const analysis = product.analysis;
  await prisma.product.update({
    where: { id: productId },
    data: {
      productType: shouldApply(product.productType, overwrite, ["未分類"]) ? analysis.productType || product.productType : product.productType,
      condition: shouldApply(product.condition, overwrite, ["未確認"]) ? analysis.conditionSummary || product.condition : product.condition,
      brandName: shouldApply(product.brandName, overwrite) ? analysis.brandName || product.brandName : product.brandName,
      characterName: shouldApply(product.characterName, overwrite) ? analysis.characterName || product.characterName : product.characterName,
      size: shouldApply(product.size, overwrite) ? analysis.size || product.size : product.size,
      color: shouldApply(product.color, overwrite) ? analysis.color || product.color : product.color,
      salePrice: product.salePrice == null || overwrite ? analysis.recommendedPrice ?? product.salePrice : product.salePrice
    }
  });
}

function shouldApply(value: string | null, overwrite: boolean, defaultValues: string[] = []) {
  return overwrite || value == null || value.trim() === "" || defaultValues.includes(value);
}
