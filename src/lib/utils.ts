import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PackFile, PackIndexData } from "@/lib/types.ts";

const ERROR_MESSAGES = {
  UNKNOWN_PARSE: "An unknown error occurred while parsing data.",
  UNKNOWN_LOAD: "An unknown error occurred while loading data.",
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// helper function to safely fetch JSON and return it as an object
export async function fetchJson(filePath: string) {
  // Ensure the path starts with a forward slash if it doesn't already
  const path = filePath.startsWith("/") ? filePath : `/${filePath}`;
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchPack(pack: PackIndexData) {
  try {
    const packFile: PackFile = await fetchJson(pack.url);
    return { packFile };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.warn(
        `Could not load or parse deck file ${pack.url}:`,
        err.message,
      );
    }
    return null;
  }
}

export async function fetchAllPacks(): Promise<PackFile[]> {
  const packIndex: PackIndexData[] = await fetchJson("pack_index.json");
  const packPromises = packIndex.map(fetchPack);
  const fetchedPacks = (await Promise.all(packPromises)).filter(Boolean) as {
    packFile: PackFile;
  }[];

  return fetchedPacks.map((item) => item.packFile);
}

export function handleError(err: unknown): string {
  if (err instanceof Error) {
    console.error("Caught an Error:", {
      message: err.message,
      name: err.name,
      stack: err.stack,
    });
    return err.message;
  }
  console.error("Caught an unknown error:", err);
  return ERROR_MESSAGES.UNKNOWN_LOAD;
}
