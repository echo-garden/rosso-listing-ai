import { localStorageProvider } from "./local";

export interface StoredFile {
  url: string;
  storageKey: string;
}

export interface StorageProvider {
  save(file: File): Promise<StoredFile>;
}

export const storage = localStorageProvider;
