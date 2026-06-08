import OpenAI from "openai";
import type { Product, ProductImage } from "@prisma/client";

export type GeneratedListingContent = {
  mercariTitle: string;
  mercariDescription: string;
  instagramCaption: string;
  onlineStoreDescription: string;
  hashtags: string;
  priceSuggestion: string;
  conditionText: string;
  checkPoints: string;
  riskWarnings: string;
};

type ProductWithImages = Product & { images: ProductImage[] };

export async function generateListingContent(product: ProductWithImages): Promise<{
  content: GeneratedListingContent;
  mockMode: boolean;
}> {
  if (!process.env.OPENAI_API_KEY) {
    return { content: buildMockContent(product), mockMode: true };
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You create Japanese listing copy for Rosso&Nero, a red-fashion focused used clothing shop. Be honest, do not claim authenticity, do not invent brand or character facts, and include rights/authenticity risk warnings where relevant. Return only JSON."
      },
      {
        role: "user",
        content: `Create JSON with keys mercariTitle, mercariDescription, instagramCaption, onlineStoreDescription, hashtags, priceSuggestion, conditionText, checkPoints, riskWarnings. All values must be strings, not arrays, numbers, or objects.

Product:
${JSON.stringify(
  {
    productType: product.productType,
    condition: product.condition,
    brandName: product.brandName,
    characterName: product.characterName,
    size: product.size,
    color: product.color,
    costPrice: product.costPrice,
    salePrice: product.salePrice,
    staffMemo: product.staffMemo,
    imageCount: product.images.length
  },
  null,
  2
)}`
      }
    ]
  });

  const raw = response.choices[0]?.message.content;
  if (!raw) {
    return { content: buildMockContent(product), mockMode: true };
  }

  try {
    return { content: normalizeGeneratedContent(JSON.parse(raw)), mockMode: false };
  } catch {
    return { content: buildMockContent(product), mockMode: true };
  }
}

function buildMockContent(product: ProductWithImages): GeneratedListingContent {
  const nameParts = [product.color, product.brandName, product.characterName, product.productType]
    .filter(Boolean)
    .join(" ");
  const title = nameParts || `${product.productType} Rosso&Nero Select`;

  return {
    mercariTitle: `${title}${product.size ? ` / ${product.size}` : ""}`,
    mercariDescription: `Rosso&Neroセレクトの${product.productType}です。赤好き、古着好きの方におすすめしやすい一着です。\n\n状態: ${product.condition}\n${product.staffMemo ? `メモ: ${product.staffMemo}\n` : ""}\nブランド名やキャラクター名は、確認できる範囲の情報として記載しています。画像と説明をご確認ください。`,
    instagramCaption: `赤が好きな方に届けたいRosso&Neroセレクト。\n${title}を店頭感のある雰囲気でピックしました。\n状態は正直にチェックして掲載しています。`,
    onlineStoreDescription: `${title}。Rosso&Neroらしい赤の存在感を楽しめるアイテムです。コンディションをご確認のうえご検討ください。`,
    hashtags: "#RossoAndNero #赤コーデ #古着 #キャラT #スニーカー #古着好き",
    priceSuggestion: product.salePrice ? `${product.salePrice.toLocaleString()}円前後` : "状態と相場確認後に設定",
    conditionText: `${product.condition}。気になる点は写真とスタッフメモを確認してください。`,
    checkPoints: "画像の写り、サイズ表記、汚れや傷、権利表記、価格を公開前に確認してください。",
    riskWarnings: "AIは真贋や権利関係を断定しません。ブランド名・キャラクター名・商標表記はスタッフが必ず確認してください。"
  };
}

function normalizeGeneratedContent(value: Partial<Record<keyof GeneratedListingContent, unknown>>): GeneratedListingContent {
  return {
    mercariTitle: stringifyGeneratedValue(value.mercariTitle),
    mercariDescription: stringifyGeneratedValue(value.mercariDescription),
    instagramCaption: stringifyGeneratedValue(value.instagramCaption),
    onlineStoreDescription: stringifyGeneratedValue(value.onlineStoreDescription),
    hashtags: stringifyGeneratedValue(value.hashtags),
    priceSuggestion: stringifyGeneratedValue(value.priceSuggestion),
    conditionText: stringifyGeneratedValue(value.conditionText),
    checkPoints: stringifyGeneratedValue(value.checkPoints),
    riskWarnings: stringifyGeneratedValue(value.riskWarnings)
  };
}

function stringifyGeneratedValue(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) {
    return value.map((item) => stringifyGeneratedValue(item)).filter(Boolean).join("\n");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
