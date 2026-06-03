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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await request.json()) as Partial<GeneratedListingContent>;
  const data = Object.fromEntries(keys.map((key) => [key, typeof body[key] === "string" ? body[key] : ""])) as GeneratedListingContent;

  const existingProduct = await prisma.product.findUnique({ where: { id } });
  if (!existingProduct) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await prisma.generatedContent.upsert({
    where: { productId: id },
    create: {
      productId: id,
      ...data
    },
    update: data
  });

  await prisma.product.update({
    where: { id },
    data: {
      title: data.mercariTitle || existingProduct.title,
      status: "generated"
    }
  });

  return NextResponse.json({ ok: true });
}
