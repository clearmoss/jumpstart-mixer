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

// helper function to safely fetch JSON and return it as an object
export async function fetchJson<T>(filePath: string): Promise<T> {
  // Ensure the path starts with a forward slash if it doesn't already
  const path = filePath.startsWith("/") ? filePath : `/${filePath}`;
  const response = await fetch(`${BASEPATH}${path}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchPack(pack: PackIndexData) {
  try {
    const packFile = await fetchJson<PackFile>(pack.url);
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
  const packIndex = await fetchJson<PackIndexData[]>("pack_index.json");
  const packPromises = packIndex.map(fetchPack);
  const fetchedPacks = (await Promise.all(packPromises)).filter(Boolean) as {
    packFile: PackFile;
  }[];

  return fetchedPacks.map((item) => item.packFile);
}

export function populateDeckList(pack: Deck, deckList: ClipboardCard[] = []) {
  // TODO: handle different versions of cards with same name
  for (const cardDeck of pack.mainBoard as CardDeck[]) {
    const existingCard = deckList.find((card) => card.name === cardDeck.name);
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
