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
  const referenceSources = buildReferenceSources(result.mockMode);

  await prisma.productAnalysis.upsert({
    where: { productId: product.id },
    create: {
      productId: product.id,
      ...analysis,
      brandCandidates: toJsonValue(analysis.brandCandidates),
      referenceSources: toJsonValue(referenceSources),
      rawJson: toJsonValue(result.rawJson),
      mockMode: result.mockMode
    },
    update: {
      ...analysis,
      brandCandidates: toJsonValue(analysis.brandCandidates),
      referenceSources: toJsonValue(referenceSources),
      rawJson: toJsonValue(result.rawJson),
      mockMode: result.mockMode
    }
  });

  return { mockMode: result.mockMode };
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}

function buildReferenceSources(mockMode: boolean) {
  return [
    {
      label: mockMode ? "Mock analysis fallback" : "OpenAI vision analysis",
      type: "ai_model",
      url: null,
      note: mockMode
        ? "OPENAI_API_KEY がない場合のローカル確認用候補です。"
        : "アップロード画像をモデル入力として解析しました。"
    },
    {
      label: "Uploaded product images",
      type: "uploaded_images",
      url: null,
      note: "商品画像、タグ画像、ダメージ/ロゴ画像を参照しました。"
    },
    {
      label: "Internal brand catalog",
      type: "internal_catalog",
      url: null,
      note: "既知ブランド名の軽量な内部辞書で候補名を正規化しました。"
    },
    {
      label: "External websites",
      type: "external_web",
      url: null,
      note: "現バージョンでは外部サイト検索・参照は実行していません。"
    }
  ];
}
