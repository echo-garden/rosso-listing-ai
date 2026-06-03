import { NextResponse } from "next/server";
import { generateListingContent } from "@/lib/ai/generate";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true }
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { content, mockMode } = await generateListingContent(product);

  await prisma.$transaction([
    prisma.generatedContent.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        ...content
      },
      update: content
    }),
    prisma.product.update({
      where: { id: product.id },
      data: {
        title: content.mercariTitle,
        status: "generated"
      }
    })
  ]);

  const url = new URL(`/products/${product.id}`, process.env.APP_URL ?? "http://localhost:3000");
  if (mockMode) {
    url.searchParams.set("mock", "1");
  }

  return NextResponse.redirect(url, { status: 303 });
}
