import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { StorageProvider } from "./index";

const uploadDir = path.join(process.cwd(), "public", "uploads");

export const localStorageProvider: StorageProvider = {
  async save(file) {
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const storageKey = `${randomUUID()}${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, storageKey), bytes);

    return {
      url: `/uploads/${storageKey}`,
      storageKey
    };
  }
};
