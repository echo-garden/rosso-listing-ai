import { readFile } from "fs/promises";
import path from "path";
import OpenAI from "openai";
import type { Product, ProductAnalysis, ProductImage } from "@prisma/client";

export type BrandCandidate = {
  name: string;
  confidence: number;
  reason: string;
};

export type ProductImageAnalysis = {
  productType: string;
  productTypeConfidence: number;
  brandName: string;
  brandConfidence: number;
  brandCandidates: BrandCandidate[];
  characterName: string;
  characterConfidence: number;
  size: string;
  sizeConfidence: number;
  color: string;
  colorConfidence: number;
  conditionSummary: string;
  tags: string;
  priceMin: number | null;
  priceMax: number | null;
  recommendedPrice: number | null;
  priceReason: string;
  warnings: string;
};

type ProductWithImages = Product & {
  images: ProductImage[];
  analysis?: ProductAnalysis | null;
};

export async function analyzeProductImages(product: ProductWithImages): Promise<{
  analysis: ProductImageAnalysis;
  rawJson: unknown;
  mockMode: boolean;
}> {
  if (!process.env.OPENAI_API_KEY || product.images.length === 0) {
    const analysis = buildMockAnalysis(product);
    return { analysis, rawJson: analysis, mockMode: true };
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const images = [...product.images].sort((a, b) => imageRoleRank(a.imageRole) - imageRoleRank(b.imageRole)).slice(0, 6);
  const imageInputs = await Promise.all(
    images.map(async (image, index) => ({
      label: `Image ${index + 1}: ${image.imageRole}`,
      url: await imageUrlToOpenAiUrl(image.url)
    }))
  );

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You analyze product photos for Rosso&Nero, a red-fashion focused used clothing shop. Extract only what is visually supported. Never assert authenticity. Return only JSON."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze these product images and return JSON with these keys:
productType, productTypeConfidence, brandName, brandConfidence, brandCandidates, characterName, characterConfidence, size, sizeConfidence, color, colorConfidence, conditionSummary, tags, priceMin, priceMax, recommendedPrice, priceReason, warnings.

Rules:
- Confidence values must be numbers from 0 to 1.
- brandCandidates must be an array of objects with name, confidence, reason.
- Use empty strings and low confidence when uncertain.
- Read size only from visible tags/labels, prioritizing images labeled "tag". Do not infer size from shape.
- Use Japanese for conditionSummary, tags, priceReason, and warnings.
- Price fields are JPY integers or null. Use a conservative resale range.
- Mention rights/authenticity risks when logos, characters, or brand marks are visible.

Existing product data:
${JSON.stringify(
  {
    productType: product.productType,
    condition: product.condition,
    brandName: product.brandName,
    characterName: product.characterName,
    size: product.size,
    color: product.color,
    salePrice: product.salePrice,
    staffMemo: product.staffMemo
  },
  null,
  2
)}`
          },
          ...imageInputs.flatMap((image) => [
            {
              type: "text" as const,
              text: image.label
            },
            {
              type: "image_url" as const,
              image_url: { url: image.url }
            }
          ])
        ]
      }
    ]
  });

  const raw = response.choices[0]?.message.content;
  if (!raw) {
    const analysis = buildMockAnalysis(product);
    return { analysis, rawJson: analysis, mockMode: true };
  }

  try {
    const parsed = JSON.parse(raw);
    return { analysis: normalizeAnalysis(parsed), rawJson: parsed, mockMode: false };
  } catch {
    const analysis = buildMockAnalysis(product);
    return { analysis, rawJson: analysis, mockMode: true };
  }
}

function buildMockAnalysis(product: ProductWithImages): ProductImageAnalysis {
  const existingType = product.productType === "未分類" ? "" : product.productType;
  const productType = existingType || inferTypeFromMemo(product.staffMemo) || "古着アイテム";
  const color = product.color ?? inferColorFromMemo(product.staffMemo) ?? "赤系";
  const recommendedPrice = product.salePrice ?? 3980;

  return {
    productType,
    productTypeConfidence: existingType ? 0.9 : 0.45,
    brandName: product.brandName ?? "",
    brandConfidence: product.brandName ? 0.75 : 0.2,
    brandCandidates: product.brandName
      ? [{ name: product.brandName, confidence: 0.75, reason: "既存入力に基づく候補です。" }]
      : [],
    characterName: product.characterName ?? "",
    characterConfidence: product.characterName ? 0.7 : 0.2,
    size: product.size ?? "",
    sizeConfidence: product.size ? 0.8 : 0.15,
    color,
    colorConfidence: product.color ? 0.85 : 0.45,
    conditionSummary: product.condition === "未確認" ? "画像とタグを確認して状態を追記してください。" : product.condition,
    tags: [productType, color, product.brandName, product.characterName].filter(Boolean).join(", "),
    priceMin: Math.max(1000, recommendedPrice - 1000),
    priceMax: recommendedPrice + 1000,
    recommendedPrice,
    priceReason: "mock解析です。実際の相場、状態、ブランド確認後に調整してください。",
    warnings: "AIは真贋や権利関係を断定しません。ブランド名、キャラクター名、商標表記はスタッフが確認してください。"
  };
}

function normalizeAnalysis(value: Record<string, unknown>): ProductImageAnalysis {
  const candidates = Array.isArray(value.brandCandidates)
    ? value.brandCandidates.map(normalizeBrandCandidate).filter((item) => item.name)
    : [];

  return {
    productType: toStringValue(value.productType),
    productTypeConfidence: toConfidence(value.productTypeConfidence),
    brandName: toStringValue(value.brandName),
    brandConfidence: toConfidence(value.brandConfidence),
    brandCandidates: candidates,
    characterName: toStringValue(value.characterName),
    characterConfidence: toConfidence(value.characterConfidence),
    size: toStringValue(value.size),
    sizeConfidence: toConfidence(value.sizeConfidence),
    color: toStringValue(value.color),
    colorConfidence: toConfidence(value.colorConfidence),
    conditionSummary: toStringValue(value.conditionSummary),
    tags: Array.isArray(value.tags) ? value.tags.map(toStringValue).filter(Boolean).join(", ") : toStringValue(value.tags),
    priceMin: toNullableInt(value.priceMin),
    priceMax: toNullableInt(value.priceMax),
    recommendedPrice: toNullableInt(value.recommendedPrice),
    priceReason: toStringValue(value.priceReason),
    warnings: toStringValue(value.warnings)
  };
}

function normalizeBrandCandidate(value: unknown): BrandCandidate {
  if (!value || typeof value !== "object") {
    return { name: "", confidence: 0, reason: "" };
  }
  const record = value as Record<string, unknown>;
  return {
    name: toStringValue(record.name),
    confidence: toConfidence(record.confidence),
    reason: toStringValue(record.reason)
  };
}

async function imageUrlToOpenAiUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }

  if (!url.startsWith("/uploads/")) {
    throw new Error(`Unsupported local image URL: ${url}`);
  }

  const filePath = path.join(process.cwd(), "public", url);
  const bytes = await readFile(filePath);
  return `data:${mimeFromPath(filePath)};base64,${bytes.toString("base64")}`;
}

function mimeFromPath(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

function imageRoleRank(role: string) {
  if (role === "tag") return 0;
  if (role === "product") return 1;
  return 2;
}

function toStringValue(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(toStringValue).filter(Boolean).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value).trim();
}

function toConfidence(value: unknown) {
  const num = typeof value === "number" ? value : Number.parseFloat(String(value ?? 0));
  if (Number.isNaN(num)) return 0;
  return Math.min(1, Math.max(0, num));
}

function toNullableInt(value: unknown) {
  if (value == null || value === "") return null;
  const num = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  return Number.isNaN(num) ? null : Math.round(num);
}

function inferTypeFromMemo(memo: string | null) {
  if (!memo) return null;
  if (memo.includes("スニーカー")) return "スニーカー";
  if (memo.includes("パーカー")) return "パーカー";
  if (memo.includes("Tシャツ") || memo.includes("Tシャツ")) return "古着Tシャツ";
  return null;
}

function inferColorFromMemo(memo: string | null) {
  if (!memo) return null;
  if (memo.includes("赤")) return "赤";
  if (memo.includes("黒")) return "黒";
  if (memo.includes("白")) return "白";
  return null;
}
