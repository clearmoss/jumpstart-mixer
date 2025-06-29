import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  CardDeck,
  ClipboardCard,
  Deck,
  PackFile,
  PackIndexData,
} from "./types";

const ERROR_MESSAGES = {
  UNKNOWN_PARSE: "An unknown error occurred while parsing data.",
  UNKNOWN_LOAD: "An unknown error occurred while loading data.",
};

export const BASEPATH = "/jumpstart-mixer";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchJson<T>(pathOrUrl: string): Promise<T> {
  // ensure the path starts with a forward slash if it doesn't already
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  const response = await fetch(`${BASEPATH}${path}`);

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status}, statusText: ${response.statusText}, url: ${response.url}`,
    );
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse JSON from ${path}: ${errorMessage}`);
  }
}

async function fetchPackFromData(
  packInfo: PackIndexData,
): Promise<PackFile | null> {
  if (!packInfo.url) {
    console.warn(`Pack info for ${packInfo.publicId} is missing a URL.`);
    return null;
  }
  try {
    return await fetchJson<PackFile>(packInfo.url);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.warn(
        `Could not load or parse pack file for ${packInfo.publicId} from ${packInfo.url}:`,
        err.message,
      );
    }
    return null;
  }
}

export async function fetchPack(packId: string): Promise<PackFile> {
  const packIndex = await fetchJson<PackIndexData[]>("pack_index.json");
  const packIndexData = packIndex.find((pack) => pack.publicId === packId);

  if (!packIndexData) {
    throw new Error(`Pack with ID "${packId}" not found in pack_index.json.`);
  }

  const packFile = await fetchPackFromData(packIndexData);

  if (!packFile) {
    throw new Error(`Failed to load pack file for pack ID "${packId}".`);
  }

  return packFile;
}

export async function fetchAllPacks(): Promise<PackFile[]> {
  const packIndex = await fetchJson<PackIndexData[]>("pack_index.json");
  const packPromises = packIndex.map(fetchPackFromData);
  const fetchedPacks = await Promise.all(packPromises);
  return fetchedPacks.filter((pack): pack is PackFile => pack !== null);
}

export function populateDeckList(pack: Deck, deckList: ClipboardCard[] = []) {
  for (const cardDeck of pack.mainBoard as CardDeck[]) {
    const existingCard = deckList.find(
      (card) =>
        card.name === cardDeck.name && card.setCode === cardDeck.setCode,
    );
    if (existingCard) {
      existingCard.count += cardDeck.count;
    } else {
      deckList.push({
        count: cardDeck.count,
        name: cardDeck.name,
        setCode: cardDeck.setCode,
        number: cardDeck.number,
      });
    }
  }
}

export function makeDeckListString(deckList: ClipboardCard[]) {
  let deckListString = "";
  for (const card of deckList) {
    deckListString += `${card.count} ${card.name} (${card.setCode}) ${card.number}\n`;
  }
  return deckListString;
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
