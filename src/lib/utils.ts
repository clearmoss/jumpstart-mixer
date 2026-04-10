import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  CardDeck,
  ClipboardCard,
  Deck,
  PackFile,
  PackIndexData,
} from "./types";
import { Cards } from "scryfall-api";

const ERROR_MESSAGES = {
  UNKNOWN_PARSE: "An unknown error occurred while parsing data.",
  UNKNOWN_LOAD: "An unknown error occurred while loading data.",
};

export const BASEPATH = "";

export const COLORS = [
  { name: "White", code: "W", order: 0 },
  { name: "Blue", code: "U", order: 1 },
  { name: "Black", code: "B", order: 2 },
  { name: "Red", code: "R", order: 3 },
  { name: "Green", code: "G", order: 4 },
  { name: "Colorless", code: "C", order: 5 },
] as const;
export type MtgColor = (typeof COLORS)[number]["code"];

export const RARITIES = [
  { name: "Mythic", code: "mythic", order: 0 },
  { name: "Rare", code: "rare", order: 1 },
  { name: "Uncommon", code: "uncommon", order: 2 },
  { name: "Common", code: "common", order: 3 },
] as const;
export type MtgRarity = (typeof RARITIES)[number]["code"];

export const TYPES = [
  { name: "Creature", code: "Creature", order: 0 },
  { name: "Planeswalker", code: "Planeswalker", order: 1 },
  { name: "Instant", code: "Instant", order: 2 },
  { name: "Sorcery", code: "Sorcery", order: 3 },
  { name: "Enchantment", code: "Enchantment", order: 4 },
  { name: "Artifact", code: "Artifact", order: 5 },
  { name: "Land", code: "Land", order: 6 },
] as const;
export type MtgType = (typeof TYPES)[number]["code"];

export const SETS = [
  { name: "Jumpstart", code: "JMP", order: 0 },
  { name: "Jumpstart 2022", code: "J22", order: 1 },
  { name: "Foundations Jumpstart", code: "J25", order: 2 },
] as const;
export type MtgSet = (typeof SETS)[number]["code"];

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

export function determinePackColors(
  pack: Deck,
): { color: string; count: number }[] {
  const colorCounts = pack.mainBoard.reduce(
    (acc, card) => {
      // if the card has colors, use them; otherwise use colorless ("C")
      const colors = card.colorIdentity.length > 0 ? card.colorIdentity : ["C"];
      for (const color of colors) {
        // accumulate total count
        acc[color as MtgColor] = (acc[color as MtgColor] || 0) + card.count;
      }
      return acc;
    },
    {} as Record<MtgColor, number>,
  );

  // return the colors sorted by frequency
  return Object.entries(colorCounts)
    .map(([color, count]) => ({ color, count }))
    .sort((a, b) => {
      const countDiff = b.count - a.count;
      if (countDiff === 0) {
        // if counts are equal, sort by color
        const colorAObj = COLORS.find((c) => c.code === (a.color as MtgColor));
        const colorBObj = COLORS.find((c) => c.code === (b.color as MtgColor));

        if (colorAObj && colorBObj) {
          return colorAObj.order - colorBObj.order;
        }
      }
      return countDiff;
    });
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

export function cleanThemeName(name: string) {
  return name.replace(/\s+\d+$|\s*\(\d+\)$/, "").trim();
}

export async function fetchThemeCard(
  packName: string,
  setCode: string,
): Promise<CardDeck | null> {
  // removing any trailing numbers (whether in parentheses or not)
  const themeName = cleanThemeName(packName);
  const card = await Cards.byName(themeName, `F${setCode}`);

  if (card) {
    // create a CardDeck object from the Scryfall card data
    return {
      name: card.name,
      setCode: card.set,
      number: card.collector_number,
      rarity: "common", // prevent holographic effect for "mythic" themes
      colors: card.colors || [],
      colorIdentity: card.color_identity || [],
      type: card.type_line || "",
      types: card.type_line ? card.type_line.split(" — ")[0].split(" ") : [],
      subtypes:
        card.type_line && card.type_line.includes(" — ")
          ? card.type_line.split(" — ")[1].split(" ")
          : [],
      supertypes: [],
      text: card.oracle_text || "",
      manaValue: card.cmc || 0,
      convertedManaCost: card.cmc || 0,
      layout: card.layout || "normal",
      identifiers: {
        scryfallId: card.id,
        scryfallOracleId: card.oracle_id,
        scryfallIllustrationId: card.illustration_id,
      },
      availability: [],
      borderColor: card.border_color || "black",
      finishes: [],
      frameVersion: card.frame || "2015",
      hasFoil: false,
      hasNonFoil: true,
      isFoil: false,
      language: "en",
      legalities: {},
      purchaseUrls: {},
      count: 1,
      uuid: "",
    } as CardDeck;
  }

  return null;
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

export function filterPacks(
  packs: PackFile[],
  colorFilter: string[],
  setFilter: string[],
  packSearchFilter: string,
  cardSearchFilter: string,
) {
  return packs.filter((pack) => {
    const packColors = determinePackColors(pack.data);
    if (packColors.length === 0) {
      return false;
    }

    const packSearchMatch =
      packSearchFilter === "" ||
      pack.data.name.toLowerCase().includes(packSearchFilter.toLowerCase());
    const cardSearchMatch =
      cardSearchFilter === "" ||
      pack.data.mainBoard.some((card) =>
        card.name.toLowerCase().includes(cardSearchFilter.toLowerCase()),
      );

    return (
      colorFilter.includes(packColors[0].color) &&
      setFilter.includes(pack.data.code) &&
      packSearchMatch &&
      cardSearchMatch
    );
  });
}

export function getTwoRandomIndexes(
  packs: PackFile[],
  allowDuplicates: boolean,
): number[] {
  const arrLength = packs.length;

  if (arrLength === 0) {
    return [];
  }

  if (!allowDuplicates && arrLength < 2) {
    return [];
  }

  const index1 = Math.floor(Math.random() * arrLength);

  if (allowDuplicates) {
    const index2 = Math.floor(Math.random() * arrLength);
    return [index1, index2];
  } else {
    let index2 = Math.floor(Math.random() * arrLength);
    while (index1 === index2) {
      index2 = Math.floor(Math.random() * arrLength);
    }
    return [index1, index2];
  }
}
