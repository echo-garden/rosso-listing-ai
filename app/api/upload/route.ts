import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
  const uploaded = await Promise.all(files.map((file) => storage.save(file)));
  return NextResponse.json({ files: uploaded });
}
