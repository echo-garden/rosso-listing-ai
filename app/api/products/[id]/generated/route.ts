import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { GeneratedListingContent } from "@/lib/ai/generate";

const keys: Array<keyof GeneratedListingContent> = [
  "mercariTitle",
  "mercariDescription",
  "instagramCaption",
  "onlineStoreDescription",
  "hashtags",
  "priceSuggestion",
  "conditionText",
  "checkPoints",
  "riskWarnings"
];

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json()) as Partial<GeneratedListingContent>;
  const data = Object.fromEntries(keys.map((key) => [key, typeof body[key] === "string" ? body[key] : ""])) as GeneratedListingContent;

  const existingProduct = await prisma.product.findUnique({ where: { id: params.id } });
  if (!existingProduct) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await prisma.generatedContent.upsert({
    where: { productId: params.id },
    create: {
      productId: params.id,
      ...data
    },
    update: data
  });

  await prisma.product.update({
    where: { id: params.id },
    data: {
      title: data.mercariTitle || existingProduct.title,
      status: "generated"
    }
  });

  return NextResponse.json({ ok: true });
}
