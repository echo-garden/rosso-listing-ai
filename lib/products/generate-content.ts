import { generateListingContent } from "@/lib/ai/generate";
import { prisma } from "@/lib/prisma";

export async function generateAndSaveListingContent(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: true,
      analysis: true
    }
  });

  if (!product) {
    throw new Error("Product not found");
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

  return { mockMode };
}
