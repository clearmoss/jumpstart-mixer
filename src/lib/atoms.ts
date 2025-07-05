import { atomWithStorage } from "jotai/utils";
import { COLORS, SETS } from "@/lib/utils.ts";
import { atom, createStore } from "jotai";
import type { CardDeck, Deck } from "@/lib/types.ts";

export const store = createStore();

export const showCategoriesAtom = atomWithStorage("showCategories", true);
export const allowDuplicatesAtom = atomWithStorage("allowDuplicates", true);
export const colorFilterAtom = atomWithStorage(
  "colorFilter",
  COLORS.map((color) => color.code),
);
export const setFilterAtom = atomWithStorage(
  "setFilter",
  SETS.map((set) => set.code),
);

export const sidebarPackSlotRefAtom = atom<HTMLDivElement | null>(null);
export const currentSidebarDeckListAtom = atom<{
  pack: Deck | null;
  publicId: string | null;
}>({
  pack: null,
  publicId: null,
});
export const currentSidebarCardAtom = atom<CardDeck | null>(null);
