import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAndSaveListingContent } from "@/lib/products/generate-content";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { mockMode } = await generateAndSaveListingContent(product.id);

  const url = new URL(`/products/${product.id}`, process.env.APP_URL ?? "http://localhost:3000");
  if (mockMode) {
    url.searchParams.set("mock", "1");
  }

  return NextResponse.redirect(url, { status: 303 });
}
